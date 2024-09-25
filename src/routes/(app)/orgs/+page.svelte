<script lang="ts">
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { auth } from '$lib/firebase';
	import { sortByCreatedAt } from '$lib/store/async_store';
	import { acceptInvitation, claimStore } from '$lib/store/claim_store';
	import { orgStore, type Org } from '$lib/store/org_store';
	import LinkCard from '$lib/ui/link_card.svelte';
	import { showError, showSuccess } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const my = derived(
		[orgStore.store, claimStore],
		([$orgStore, $claimStore], set) => {
			if (!$orgStore) {
				return;
			}
			const orgClaims = $claimStore.orgs;
			const myOrgs: Org[] = [];
			const myInvitations: Org[] = [];
			const orgs = Object.keys($orgStore);
			for (const id of orgs) {
				if (Object.hasOwn(orgClaims, id)) {
					myOrgs.push($orgStore[id]);
				} else {
					myInvitations.push($orgStore[id]);
				}
			}
			myOrgs.sort(sortByCreatedAt);
			set({
				orgs: myOrgs,
				invitations: myInvitations,
			});
		},
		{ orgs: [], invitations: [] } as { orgs: Org[]; invitations: Org[] },
	);

	onMount(() => {
		orgStore.fetchAll().catch(showError);
	});

	async function accept(id: string) {
		if (!auth.currentUser) {
			showError('Please sign in');
			return;
		}
		if (await acceptInvitation(id)) {
			await auth.currentUser?.getIdToken(true);
			showSuccess('Success - please refresh this page!');
		} else {
			showError('Something went wrong');
		}
	}
</script>

<Breadcrumb />

<main class="max-w-screen-md my-8 mx-auto">
	{#if $my.invitations.length}
		<h2 class="h2">Invitations</h2>
		<p>You have invitations to watch orgs</p>
		<nav class="list-nav my-8">
			<ol class="list">
				{#each $my.invitations as org}
					<li>
						<span class="badge text-6xl">💌</span>
						<span class="flex-auto">{org.name}</span>
						<button class="btn variant-filled-primary" on:click={() => accept(org.id)}
							>Accept</button
						>
					</li>
				{/each}
			</ol>
		</nav>
		<hr class="my-8" />
	{/if}
	<nav class="my-8 flex justify-center flex-wrap gap-4">
		{#each $my.orgs as org}
			<LinkCard href="orgs/{org.id}" image={org.logo} text={org.name} />
		{/each}
	</nav>
	<div class="text-center my-12">
		<a href="/orgs/new" class="btn variant-ghost-primary">
			<span>＋</span>
			<span>New org</span>
		</a>
	</div>
</main>
