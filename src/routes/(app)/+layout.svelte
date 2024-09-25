<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { userStore } from '$lib/store/user_store';

	const toastStore = getToastStore();

	onMount(() => {
		auth.authStateReady().then(() => {
			if (!auth.currentUser) {
				toastStore.trigger({
					message: 'Please sign in to continue',
					background: 'variant-filled-error',
				});
				goto('/sign-in');
			}
		});
	});
</script>

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10" scrollbarGutter="auto">
	<svelte:fragment slot="header"
		><AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">RewardStationOmega</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<a class="btn-icon hover:variant-soft-primary" href="/profile">👷‍♂️</a>
			</svelte:fragment>
			<a
				class="btn hover:variant-ghost-primary"
				class:variant-ghost-primary={$page.url.pathname.substring(0, 5) === '/orgs'}
				href="/orgs">Orgs</a
			>
			{#if $userStore?.claims.admin}
				<a
					class="btn hover:variant-ghost-primary"
					class:variant-ghost-primary={$page.url.pathname.substring(0, 8) === '/rewards'}
					href="/rewards">Rewards</a
				>
			{/if}
		</AppBar>
	</svelte:fragment>
	<div>
		<slot />
	</div>
</AppShell>
