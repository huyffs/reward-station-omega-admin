<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import CampaignForm from '$lib/form/campaign_form.svelte';
	import { useProjectStore } from '$lib/store/project_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { showError } from '$lib/util/notif';
	import { orgStore } from '$lib/store/org_store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);

	onMount(() => {
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-sm mx-auto my-8">
	{#if $campaign}
		<CampaignForm
			campaign={$campaign}
			orgId={$page.params.orgId}
			projectId={$page.params.projectId}
		/>
	{:else}
		Loading...
	{/if}
</main>
