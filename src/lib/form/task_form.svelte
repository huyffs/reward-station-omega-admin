<script lang="ts" context="module">
	export type TaskFormData = {
		name: string;
		description: string;
		link: string;
		images: string[];
		point: number;
	};
</script>

<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import UploadForm from './upload_form.svelte';
	import type { Task } from '$lib/store/campaign_store';

	export let task: Task;
	let data: TaskFormData = {
		name: task.name,
		description: task.description,
		link: task.link,
		images: [...task.images],
		point: task.point ?? 0,
	};

	export let orgId: string;
	export let projectId: string;
	export let campaignId: string | undefined = undefined;

	const modalStore = getModalStore();
	let uploadMode = false;

	function onUploadClick() {
		uploadMode = true;
	}

	function deleteImageAt(index: number) {
		data.images.splice(index, 1);
		data.images = [...data.images];
		// dispatch('update');
	}

	function onUploadFormDismiss(event: CustomEvent<string[] | undefined>) {
		if (event.detail) {
			data.images = [...data.images, ...event.detail];
		}
		uploadMode = false;
		// dispatch('update');
	}
	function onSubmit() {
		$modalStore[0]?.response!({
			...data,
			id: task.id,
		});
		modalStore.close();
	}
</script>

{#if uploadMode}
	<UploadForm
		section="task"
		kind="gallery"
		{orgId}
		{projectId}
		{campaignId}
		taskId={task.id}
		on:dismiss={onUploadFormDismiss}
	/>
{:else}
	<form on:submit|preventDefault={onSubmit} class="p-4 card">
		<header>Task</header>
		<main class="p-4">
			<div class="label">Gallery</div>
			<div class="flex flex-col gap-4">
				{#if campaignId}
					{#if data.images.length}
						<div class="flex flex-wrap justify-center gap-4">
							{#each data.images as img, i}
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
					<button
						class="btn variant-ghost-primary mx-auto block"
						type="button"
						on:click={onUploadClick}>Upload images</button
					>
				{:else}
					<div class="flex justify-center items-center h-24">
						<p>Save the campaign to upload images</p>
					</div>
				{/if}
			</div>
			<label class="label">
				<span>Title</span>
				<input
					name="name"
					bind:value={data.name}
					placeholder="Short title"
					required
					class="input p-2"
				/>
			</label>
			<label class="label">
				<span>Description</span>
				<textarea
					class="textarea p-2"
					rows="4"
					name="description"
					bind:value={data.description}
					placeholder="Long description"
				/>
			</label>
			<label class="label">
				<span>Reward point</span>
				<input
					name="point"
					type="number"
					bind:value={data.point}
					placeholder="Points to reward"
					required
					class="input p-2"
				/>
			</label>
			<label class="label">
				<span>Link</span>
				<input name="link" bind:value={data.link} placeholder="URL to the task" class="input p-2" />
			</label>
		</main>
		<footer class="flex justify-between gap-4 mt-16">
			<button class="btn variant-ghost-error" type="button" on:click={modalStore.close}
				>Cancel</button
			>
			<button class="btn variant-filled-primary" type="submit">Done</button>
		</footer>
	</form>
{/if}
