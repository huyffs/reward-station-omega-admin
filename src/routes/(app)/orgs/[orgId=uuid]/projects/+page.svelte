<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById, sortByName } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { useProjectStore } from '$lib/store/project_store';
	import LinkCard from '$lib/ui/link_card.svelte';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const projects = derived(projectStore.store, ($projectStore) => {
		return Object.values($projectStore).sort(sortByName);
	});

	onMount(() => {
		projectStore.fetchAll().catch(showError);
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	<nav class="my-8 flex justify-center flex-wrap gap-4">
		{#each $projects as project}
			<LinkCard href="projects/{project.id}" image={project.logo} text={project.name} />
		{/each}
	</nav>
	<div class="text-center my-12">
		<a href="projects/new" class="btn variant-ghost-primary">
			<span>＋</span>
			<span>New project</span>
		</a>
	</div>
</main>
