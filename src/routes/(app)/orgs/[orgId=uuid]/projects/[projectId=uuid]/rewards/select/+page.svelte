<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useProjectStore } from '$lib/store/project_store';
	import { useProjectRewardStore } from '$lib/store/project_reward_store';
	import ProjectRewardLinkCard from '$lib/ui/project_reward_link_card.svelte';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const projectRewardStore = useProjectRewardStore($page.params.orgId, $page.params.projectId);
	const projectRewards = derived(projectRewardStore.store, ($projectRewardStore) => {
		const list = Object.values($projectRewardStore).filter((pr) => !pr.project_id);
		if (list.length) {
			list.sort(sortByName);
		}
		return list;
	});

	onMount(() => {
		projectRewardStore.fetchAll().catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
		if (!$projectRewards) {
			projectStore.fetchAll().catch(showError);
		}
	});

	async function selectReward(id: string) {
		projectRewardStore.create({
			path: `${$page.params.projectId}`,
			data: {
				point: 1,
				active: true,
			},
		});
	}
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	<div class="flex gap-8 items-center">
		<a href="." class="btn variant-ringed-secondary hover:variant-ghost-secondary">
			<span>&lt;</span>
		</a>
		<h1 class="h1">Select rewards</h1>
	</div>

	{#if $projectRewards.length}
		<nav class="my-8 flex justify-center flex-wrap gap-4">
			{#each $projectRewards as projectReward}
				<ProjectRewardLinkCard
					{projectReward}
					orgId={$page.params.orgId}
					projectId={$page.params.projectId}
					rewardId={projectReward.id}
				/>
			{/each}
		</nav>
	{:else}
		<p class="p-4 text-center">None available</p>
	{/if}
	<div class="text-center my-12"></div>
</main>
