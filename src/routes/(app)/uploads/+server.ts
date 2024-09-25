import { error } from '@sveltejs/kit';
import { canSudo, decodeJwt, hasOrgClaim, isValidJwt } from '$lib/util/auth';
import { PUBLIC_MEDIA_URL_PREFIX } from '$env/static/public';
import type { UploadSection, UploadKind } from '$lib/form/upload_form.svelte';
import { uploadFile } from '$lib/util/upload';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const bucket = locals.PROOF_BUCKET;
	if (!bucket) {
		return error(500, {
			message:
				'Must run in cloudflare workers environment. Run the wrangler-proxy locally: wrangler dev node_modules/wrangler-proxy/dist/worker.js --remote',
		});
	}

	const authorization = request.headers.get('Authorization');
	if (!authorization || authorization.length < 7) {
		return error(401);
	}

	const token = decodeJwt(authorization.slice(7));
	if (!token) {
		return error(401);
	}

	if (!isValidJwt(token)) {
		return error(401);
	}

	const form = await request.formData();
	const section = form.get('section') as UploadSection;
	const kind = form.get('kind') as UploadKind;
	const name = new Date().getTime().toString(36);

	let paths: string[] = [];

	if (section === 'profile') {
		paths = ['u', token.payload.sub];
	} else if (section === 'reward') {
		if (!canSudo(token)) {
			return error(403);
		}
		const rewardId = form.get('reward_id');
		if (!rewardId) {
			return error(400, 'Missing reward id');
		}
		paths = ['r', rewardId.toString()];
	} else {
		switch (section) {
			case 'task':
				const taskId = form.get('task_id');
				if (!taskId) {
					return error(400, 'Missing task id');
				}
				paths.unshift(taskId.toString());
			// no break;
			case 'campaign':
				const campaignId = form.get('campaign_id');
				if (!campaignId) {
					return error(400, 'Missing campaign id');
				}
				paths.unshift(campaignId.toString());
			// no break;
			case 'project':
				const projectId = form.get('project_id');
				if (!projectId) {
					return error(400, 'Missing project id');
				}
				paths.unshift(projectId.toString());
			// no break;
			case 'org':
				const orgId = form.get('org_id');
				if (!orgId) {
					return error(400, 'Missing org id');
				}
				if (!hasOrgClaim(token, orgId.toString())) {
					return error(403);
				}
				paths.unshift(orgId.toString());
				break;
			default:
				return error(400, 'Missing section');
		}
		paths.unshift('a');
	}

	const path = paths.join('/');
	const images: string[] = [];

	switch (kind) {
		case 'hero':
			const file = form.get('files') as File;
			if (!file) {
				return error(400, {
					message: 'No file data ',
				});
			}
			const filename = await uploadFile(locals.PROOF_BUCKET, path, file, name);
			if (filename) {
				images.push(`${PUBLIC_MEDIA_URL_PREFIX}/${path}/${filename}`);
			}
			break;
		case 'gallery':
			const files = form.getAll('files') as File[];
			if (!files || !files.length) {
				return error(400, {
					message: 'No file data ',
				});
			}
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				if (!file.name) {
					return error(400, {
						message: 'No content received',
					});
				}
				const filename = await uploadFile(
					locals.PROOF_BUCKET,
					path,
					file,
					`${name}${i.toString(36)}`,
				);
				if (filename) {
					images.push(`${PUBLIC_MEDIA_URL_PREFIX}/${path}/${filename}`);
				}
			}
			break;
		default:
			return error(400, 'Missing kind');
	}

	return new Response(JSON.stringify(images));
};
