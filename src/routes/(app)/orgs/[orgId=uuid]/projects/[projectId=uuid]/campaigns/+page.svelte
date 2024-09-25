<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useProjectStore } from '$lib/store/project_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import LinkCard from '$lib/ui/link_card.svelte';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaigns = derived(campaignStore.store, ($campaignStore) => {
		const list = Object.values($campaignStore);
		if (list.length) {
			list.sort(sortByName);
		}
		return list;
	});

	onMount(() => {
		campaignStore.fetchAll().catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	{#if campaigns}
		<nav class="my-8 flex justify-center flex-wrap gap-4">
			{#each $campaigns as campaign}
				<LinkCard href="campaigns/{campaign.id}" image={campaign.logo} text={campaign.name} />
			{/each}
		</nav>
	{/if}
	<div class="text-center my-12">
		<a href="campaigns/new" class="btn variant-ghost-primary">
			<span>＋</span>
			<span>New campaign</span>
		</a>
	</div>
</main>
