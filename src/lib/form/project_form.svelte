<script lang="ts">
	import { goto } from '$app/navigation';
	import UploadGallery from '$lib/ui/upload_gallery.svelte';
	import { showError, showSuccess } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { useProjectStore, type Project } from '$lib/store/project_store';
	import { auth } from '$lib/firebase';
	import UploadFrame from '$lib/ui/upload_frame.svelte';
	import { strDate } from '$lib/store/async_store';
	import { canSudo } from '$lib/util/auth';
	import { userStore } from '$lib/store/user_store';

	type Form = {
		name: string;
		description: string;
		website: string;
		networks: Record<string, string>;
		logo?: string;
		images: string[];
		feature_from: string;
		feature_until: string;
	};

	export let orgId: string;
	export let project: Project | undefined = undefined;

	const modalStore = getModalStore();
	const projectStore = useProjectStore(orgId);
	const form: Form = {
		name: project?.name || '',
		logo: project?.logo,
		images: project?.images ? [...project.images] : [],
		website: project?.website || '',
		networks: project?.networks || {
			x: '',
			telegram: '',
			facebook: '',
			opensea: '',
			ethereum: '',
		},
		description: project?.description || '',
		feature_from: strDate(project?.featureFrom) || '',
		feature_until: strDate(project?.featureUntil) || '',
	};

	let inFlight = false;

	function onUpdateLogo(e: CustomEvent<string | undefined>) {
		form.logo = e.detail;
	}

	async function onSubmit() {
		if (!auth.currentUser) {
			showError('Please sign in');
			return;
		}
		if (!form.name) {
			showError('Name is required');
		}
		inFlight = true;
		if (project) {
			const updateRes = await projectStore.patch(project.id, form);
			if (updateRes.ok) {
				showSuccess();
			} else {
				showError(`${updateRes.status}: ${updateRes.message}`);
			}
		} else {
			const createRes = await projectStore.create(form);
			auth.currentUser.getIdTokenResult(true);
			if (createRes.ok) {
				showSuccess();
				goto(createRes.id);
			} else {
				showError(`${createRes.status}: ${createRes.message}`);
			}
		}
		inFlight = false;
	}

	function deleteProject() {
		if (!project) {
			return;
		}
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete ' + project.name,
			body: 'This will permanently remove the project',
			response(r) {
				if (r && project) {
					projectStore.delete(project.id).then((res) => {
						if (res.ok) {
							showSuccess('Deleted sucessfully!');
							goto('..');
						} else {
							showError(`Failed to delete campaign: ${res.message}`);
						}
					});
				}
			},
		});
	}
</script>

<form on:submit|preventDefault={onSubmit} class="p-4 card">
	{#if project}
		{#if $userStore?.claims.admin}
			<label class="label">
				<span>Feature from</span>
				<input name="feature_from" type="date" bind:value={form.feature_from} class="input p-2" />
			</label>
			<label class="label">
				<span>Feature until</span>
				<input name="feature_until" type="date" bind:value={form.feature_until} class="input p-2" />
			</label>
			<hr class="my-4" />
		{/if}
		<header class="">
			<div class="label">Logo</div>
			<UploadFrame
				section="project"
				bind:image={form.logo}
				{orgId}
				projectId={project?.id}
				on:update={onUpdateLogo}
			/>
			<hr class="my-8" />
			<div class="label">Gallery</div>
			<UploadGallery
				bind:images={form.images}
				section="project"
				{orgId}
				projectId={project?.id}
				on:update={onSubmit}
			/>
		</header>
	{/if}
	<main class="my-4">
		<label class="label">
			<span>Name</span>
			<input
				name="name"
				bind:value={form.name}
				placeholder="E.g. Luna Project"
				required
				class="input p-2"
			/>
		</label>
		<label class="label my-4">
			<span>Description</span>
			<textarea
				name="description"
				bind:value={form.description}
				rows="6"
				placeholder="Describe your project"
				required
				class="textarea p-2"
			/>
		</label>
		<label class="label my-4">
			<span>Project Website</span>
			<input
				name="website"
				bind:value={form.website}
				placeholder="Enter your project website"
				required
				class="input p-2"
			/>
		</label>
		<div class="label">
			<span>Social and crypto networks</span>
		</div>
		<div class="input-group input-group-divider grid-cols-[1fr_3fr] mb-2">
			<div class="input-group-shim">X (Twitter)</div>
			<input name="network-x" bind:value={form.networks.x} placeholder="https://..." class="p-2" />
		</div>
		<div class="input-group input-group-divider grid-cols-[1fr_3fr] mb-2">
			<div class="input-group-shim">Telegram</div>
			<input
				name="network-telegram"
				bind:value={form.networks.telegram}
				placeholder="https://..."
				class="p-2"
			/>
		</div>
		<div class="input-group input-group-divider grid-cols-[1fr_3fr] mb-2">
			<div class="input-group-shim">Facebook</div>
			<input
				name="network-facebook"
				bind:value={form.networks.facebook}
				placeholder="https://..."
				class="p-2"
			/>
		</div>
		<div class="input-group input-group-divider grid-cols-[1fr_3fr] mb-2">
			<div class="input-group-shim">OpenSea</div>
			<input
				name="network-opensea"
				bind:value={form.networks.opensea}
				placeholder="https://..."
				class="p-2"
			/>
		</div>
		<div class="input-group input-group-divider grid-cols-[1fr_3fr] mb-2">
			<div class="input-group-shim">Ethereum</div>
			<input
				name="network-ethereum"
				bind:value={form.networks.ethereum}
				placeholder="https://..."
				class="p-2"
			/>
		</div>
	</main>

	<footer class="flex justify-between gap-4 mt-2">
		<a href="." class="btn variant-ringed">← Back</a>
		<button
			type="button"
			class="btn variant-ringed-error"
			disabled={inFlight || !project}
			on:click={() => deleteProject()}>Delete</button
		>
		<button class="btn variant-filled-primary" type="submit" disabled={inFlight}>Save</button>
	</footer>
</form>
