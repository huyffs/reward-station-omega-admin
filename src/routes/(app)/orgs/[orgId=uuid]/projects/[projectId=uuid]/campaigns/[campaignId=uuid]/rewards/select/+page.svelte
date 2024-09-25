<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import { useCampaignRewardStore } from '$lib/store/campaign_reward_store';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import CampaignRewardLinkCard from '$lib/ui/campaign_reward_link_card.svelte';

	const org = derivedById(orgStore, $page.params.orgId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);
	const campaignRewardStore = useCampaignRewardStore($page.params.orgId, $page.params.campaignId);
	const campaignRewards = derived(campaignRewardStore.store, ($campaignRewardStore) => {
		const list = Object.values($campaignRewardStore).filter((pr) => !pr.campaign_id);
		if (list.length) {
			list.sort(sortByName);
		}
		return list;
	});

	onMount(() => {
		campaignRewardStore.fetchAll().catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
		if (!$campaignRewards) {
			campaignStore.fetchAll().catch(showError);
		}
	});

	async function selectReward(id: string) {
		campaignRewardStore.create({
			path: `${$page.params.campaignId}`,
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

	{#if $campaignRewards.length}
		<nav class="my-8 flex justify-center flex-wrap gap-4">
			{#each $campaignRewards as campaignReward}
				<CampaignRewardLinkCard
					{campaignReward}
					orgId={$page.params.orgId}
					projectId={$page.params.projectId}
					campaignId={$page.params.campaignId}
					rewardId={campaignReward.id}
				/>
			{/each}
		</nav>
	{:else}
		<p class="p-4 text-center">None available</p>
	{/if}
</main>
