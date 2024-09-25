<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import OrgForm from '$lib/form/org_form.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';

	const org = derivedById(orgStore, $page.params.orgId);

	onMount(() => {
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
	});
</script>

<Breadcrumb />

<main class="max-w-screen-sm mx-auto my-8">
	{#if $org}
		<OrgForm org={$org} />
	{:else}
		Loading...
	{/if}
</main>
