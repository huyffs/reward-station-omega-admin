<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import UploadModal from './upload_modal.svelte';

	const modalStore = getModalStore();

	export let section: string;
	export let orgId: string | undefined = undefined;
	export let projectId: string | undefined = undefined;
	export let campaignId: string | undefined = undefined;
	export let rewardId: string | undefined = undefined;
	export let image: string | undefined;

	const dispatch = createEventDispatcher<{ update: string | undefined }>();

	function onUploadClick() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: UploadModal,
				props: {
					section,
					kind: 'hero',
					orgId,
					projectId,
					campaignId,
					rewardId,
				},
			},
			response: updateImage,
		});
	}

	function updateImage(images?: string[]) {
		if (images) {
			image = images?.length ? images[0] : undefined;
			dispatch('update', image);
		}
		modalStore.close();
	}

	function removeImage() {
		dispatch('update');
	}
</script>

<div class="flex flex-col gap-4">
	{#if image}
		<div
			class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-4 h-60"
		>
			<div class="snap-center shrink-0 card card-hover w-40 h-40 relative">
				<img src={image} alt={section} class="w-full h-full object-cover" />
				<button
					class="badge-icon variant-filled-error absolute top-0 right-0"
					type="button"
					on:click={removeImage}>X</button
				>
			</div>
		</div>
	{:else}
		<div
			class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
		>
			🏞️
		</div>
	{/if}
	<button class="btn variant-ghost-primary mx-auto block" type="button" on:click={onUploadClick}
		>Upload image</button
	>
</div>
