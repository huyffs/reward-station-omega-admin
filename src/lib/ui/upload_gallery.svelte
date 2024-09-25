<script lang="ts">
	import type { UploadSection } from '$lib/form/upload_form.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import UploadModal from './upload_modal.svelte';

	export let section: UploadSection;
	export let orgId: string | undefined = undefined;
	export let projectId: string | undefined = undefined;
	export let campaignId: string | undefined = undefined;
	export let taskId: string | undefined = undefined;
	export let rewardId: string | undefined = undefined;
	export let images: string[];

	const modalStore = getModalStore();
	const dispatch = createEventDispatcher<{ update: string[] | undefined }>();

	function onUploadClick() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: UploadModal,
				props: {
					section,
					kind: 'gallery',
					orgId,
					projectId,
					campaignId,
					taskId,
					rewardId,
				},
			},
			response: updateImage,
		});
	}

	function updateImage(newImages?: string[]) {
		if (newImages) {
			images = newImages;
			dispatch('update', images);
		}
		modalStore.close();
	}

	function deleteImageAt(index: number) {
		images.splice(index, 1);
		images = [...images];
		dispatch('update');
	}
</script>

<div class="flex flex-col gap-4">
	{#if images.length}
		<div class="flex flex-wrap justify-center gap-4">
			{#each images as img, i}
				<div class="card w-40 h-40 relative">
					<img src={img} alt="Task image {i}" class="w-full h-full object-cover" />
					<button
						class="badge-icon variant-filled-error absolute top-0 right-0"
						type="button"
						on:click={() => deleteImageAt(i)}>X</button
					>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
		>
			🏞️
		</div>
	{/if}
	<button class="btn variant-ghost-primary mx-auto block" type="button" on:click={onUploadClick}
		>Upload images</button
	>
</div>
