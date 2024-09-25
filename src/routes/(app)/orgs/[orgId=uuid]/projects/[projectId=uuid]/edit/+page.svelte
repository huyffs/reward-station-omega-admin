<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ProjectForm from '$lib/form/project_form.svelte';
	import { useProjectStore } from '$lib/store/project_store';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { showError } from '$lib/util/notif';
	import { orgStore } from '$lib/store/org_store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);

	onMount(() => {
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-sm mx-auto my-8">
	{#if $project}
		<ProjectForm project={$project} orgId={$page.params.orgId} />
	{:else}
		Loading...
	{/if}
</main>
