<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { useProjectStore } from '$lib/store/project_store';
	import ImageGallery from '$lib/ui/image_gallery.svelte';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';

	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);

	onMount(() => {
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto p-4">
	{#if $project}
		<div class="flex items-center gap-8">
			<h1 class="h1">
				{$project.name}
			</h1>
			<a href="{$project.id}/edit" class="btn variant-ringed-primary hover:variant-ghost-primary"
				>✏️ Edit</a
			>
			<a
				href="{$project.id}/campaigns"
				class="btn variant-ringed-tertiary hover:variant-ghost-tertiary">Campaigns</a
			>
			<a
				href="{$project.id}/rewards"
				class="btn variant-ringed-secondary hover:variant-ghost-secondary">Rewards</a
			>
		</div>
		{#if $project.website}
			<p>{$project.website}</p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Logo</h4>
		{#if $project.logo}
			<div class="w-48">
				<img src={$project.logo} alt="logo" class="bg-black/50 w-full aspect-square object-cover" />
			</div>
		{:else}
			<div class="snap-center shrink-0 card w-40 h-40 flex justify-center items-center text-9xl">
				🏞️
			</div>
		{/if}

		<h4 class="h4 mt-8 mb-2">Description</h4>
		{#if $project.description}
			<p>{$project.description}</p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Networks</h4>
		<ul class="list">
			{#each Object.keys($project.networks) as n}
				<li>
					<span class="capitalize inline-block w-20">{n}:</span>
					<a href={$project.networks[n]} class="anchor">{$project.networks[n]}</a>
				</li>
			{/each}
		</ul>

		<h4 class="h4 mt-8 mb-2">Images</h4>
		<ImageGallery images={$project.images} />
	{:else}
		Loading...
	{/if}
</main>
