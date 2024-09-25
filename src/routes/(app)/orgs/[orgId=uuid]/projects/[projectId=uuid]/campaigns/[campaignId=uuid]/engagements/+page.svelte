<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByUpdatedAt } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import { useEngagementStore } from '$lib/store/engagement_store';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import { useProjectStore } from '$lib/store/project_store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);
	const engagementStore = useEngagementStore($page.params.orgId, $page.params.campaignId);
	const engagements = derived(engagementStore.store, ($engagementStore) => {
		return Object.values($engagementStore).sort(sortByUpdatedAt);
	});

	onMount(() => {
		engagementStore.fetchAll().catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	<div class="flex gap-8 items-center">
		<h1 class="h1">Engagements</h1>
	</div>
	{#if $engagements.length}
		<dl class="list-dl my-8 mr-4">
			{#each $engagements as eng}
				<a href="engagements/{eng.chain_id}/{eng.signer_address}" class="flex gap-2">
					<span class="badge w-12 text-3xl">{eng.submitted - eng.approved}</span>
					<span class="flex-auto">
						<dt>{eng.user_name}</dt>
						<dd class="text-surface-300 text-xs">{eng.signer_address}</dd>
					</span>
					<span
						class="btn-icon variant-ghost-warning shrink-0 w-8 aspect-square"
						class:!variant-ghost-success={eng.submitted === eng.approved}>&gt;</span
					>
				</a>
			{/each}
		</dl>
	{:else}
		No engagement yet
	{/if}
</main>
