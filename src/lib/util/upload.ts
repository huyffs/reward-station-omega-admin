import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

export async function uploadFile(bucket: R2Bucket, path: string, file: File, name: string) {
	let ext: string = '';
	switch (file.type) {
		case 'image/jpeg':
			ext = 'jpeg';
			break;
		case 'image/png':
			ext = 'png';
			break;
		case 'image/webp':
			ext = 'webp';
			break;
		default:
			const i = file.name.lastIndexOf('.');
			if (i > 0) {
				ext = file.name.substring(i);
			}
	}

	const filename = `${name}.${ext}`;
	try {
		const res = await bucket.put(`${path}/${filename}`, file, {
			httpMetadata: {
				contentType: file.type,
			},
			customMetadata: {
				name: file.name,
			},
		});
		if (!dev && !res) {
			console.log('up res:', res);
			return;
		}
	} catch (err) {
		let message: string;
		if (err instanceof TypeError) {
			message = err.cause?.toString() || err.message;
		} else {
			message = 'Upload to bucket failed: ' + err;
		}
		error(503, message);
	}
	return filename;
}
