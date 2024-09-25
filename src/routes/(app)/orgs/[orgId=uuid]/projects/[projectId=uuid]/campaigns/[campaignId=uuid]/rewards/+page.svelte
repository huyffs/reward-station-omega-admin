<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useCampaignRewardStore, type CampaignReward } from '$lib/store/campaign_reward_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import CampaignRewardLinkCard from '$lib/ui/campaign_reward_link_card.svelte';
	import RewardCard from '$lib/ui/reward_card.svelte';
	import { showError } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const modalStore = getModalStore();
	const org = derivedById(orgStore, $page.params.orgId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);
	const campaignRewardStore = useCampaignRewardStore($page.params.orgId, $page.params.campaignId);
	const campaignRewards = derived(campaignRewardStore.store, ($campaignRewardStore) => {
		const list = Object.values($campaignRewardStore).filter((pr) => !!pr.campaign_id);
		if (list.length) {
			list.sort(sortByName);
		}
		return list;
	});

	onMount(() => {
		campaignRewardStore.fetchAll({}).catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
	});

	function showEditModal(campaignReward: CampaignReward) {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: CampaignRewardLinkCard,
				props: {
					campaignReward,
					orgId: $page.params.orgId,
					campaignId: $page.params.campaignId,
					rewardId: campaignReward.id,
				},
			},
		});
	}
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	<div class="flex gap-8 items-center">
		<h1 class="h1">Rewards</h1>
		<a href="rewards/select" class="btn variant-ringed-secondary hover:variant-ghost-secondary">
			<span>＋</span>
			<span>Select rewards</span>
		</a>
	</div>
	{#if campaignRewards}
		<nav class="my-8 flex justify-center flex-wrap gap-4">
			{#each $campaignRewards as campaignReward}
				<RewardCard
					image={(campaignReward.images.length && campaignReward.images[0]) || undefined}
					title={campaignReward.name}
				>
					<div class="label text-center" slot="head">
						<span class="text-surface-400">Supply</span>
						<span>{campaignReward.coupon_total || 'Unknown'}</span>
					</div>
					<ul class="list">
						<li>
							<span class="flex-auto">Value</span>
							<span>{campaignReward.point}</span>
						</li>
						<li>
							<span class="flex-auto">Active</span>
							<input type="checkbox" checked={campaignReward.active} disabled class="checkbox" />
						</li>
						<li>
							<span class="flex-auto">Max mint</span>
							<span>{campaignReward.max_mint || 'Unlimited'}</span>
						</li>
						<li>
							<span class="flex-auto">Per user</span>
							<span>{campaignReward.user_mint || 'Unlimited'}</span>
						</li>
						<li class="flex justify-center pt-4">
							<button
								class="btn variant-ghost-primary hover:variant-filled-primary item-center"
								on:click={() => showEditModal(campaignReward)}>Edit</button
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
