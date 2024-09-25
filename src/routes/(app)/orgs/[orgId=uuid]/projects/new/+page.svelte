<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import ProjectForm from '$lib/form/project_form.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useProjectStore } from '$lib/store/project_store';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';

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
<main>
	<ProjectForm orgId={$page.params.orgId} />
</main>
