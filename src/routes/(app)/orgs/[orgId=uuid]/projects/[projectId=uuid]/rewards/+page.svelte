<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useProjectRewardStore, type ProjectReward } from '$lib/store/project_reward_store';
	import { useProjectStore } from '$lib/store/project_store';
	import ProjectRewardLinkCard from '$lib/ui/project_reward_link_card.svelte';
	import RewardCard from '$lib/ui/reward_card.svelte';
	import { showError } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const modalStore = getModalStore();
	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const projectRewardStore = useProjectRewardStore($page.params.orgId, $page.params.projectId);
	const projectRewards = derived(projectRewardStore.store, ($projectRewardStore) => {
		const list = Object.values($projectRewardStore).filter((pr) => !!pr.project_id);
		if (list.length) {
			list.sort(sortByName);
		}
		return list;
	});

	onMount(() => {
		projectRewardStore.fetchAll({}).catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
	});

	function showEditModal(projectReward: ProjectReward) {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: ProjectRewardLinkCard,
				props: {
					projectReward,
					orgId: $page.params.orgId,
					projectId: $page.params.projectId,
					rewardId: projectReward.id,
				},
			},
		});
	}
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	{#if projectRewards}
		<nav class="my-8 flex justify-center flex-wrap gap-4">
			{#each $projectRewards as projectReward}
				<RewardCard
					image={(projectReward.images.length && projectReward.images[0]) || undefined}
					title={projectReward.name}
				>
					<div class="label text-center" slot="head">
						<span class="text-surface-400">Supply</span>
						<span>{projectReward.coupon_total || 'Unknown'}</span>
					</div>
					<ul class="list">
						<li>
							<span class="flex-auto">Value</span>
							<span>{projectReward.point}</span>
						</li>
						<li>
							<span class="flex-auto">Active</span>
							<input type="checkbox" checked={projectReward.active} disabled class="checkbox" />
						</li>
						<li>
							<span class="flex-auto">Max mint</span>
							<span>{projectReward.max_mint || 'Unlimited'}</span>
						</li>
						<li>
							<span class="flex-auto">Per user</span>
							<span>{projectReward.user_mint || 'Unlimited'}</span>
						</li>
						<li class="flex justify-center pt-4">
							<button
								class="btn variant-ghost-primary hover:variant-filled-primary item-center"
								on:click={() => showEditModal(projectReward)}>Edit</button
							>
						</li>
					</ul>
				</RewardCard>
			{/each}
		</nav>
	{/if}
	<div class="text-center my-12">
		<a href="rewards/select" class="btn variant-ghost-primary">
			<span>＋</span>
			<span>Select rewards</span>
		</a>
	</div>
</main>
