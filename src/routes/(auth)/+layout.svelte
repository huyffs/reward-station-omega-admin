<script lang="ts">
	import { AppShell, LightSwitch, getToastStore } from '@skeletonlabs/skeleton';
	import { userStore } from '$lib/store/user_store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';

	const toastStore = getToastStore();

	onMount(() => {
		auth.authStateReady().then(() => {
			if ($userStore?.user) {
				toastStore.trigger({
					message: 'You are already signed in!',
					background: 'variant-filled-success',
				});
				goto('/');
			}
		});
	});
</script>

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10">
	<svelte:fragment slot="header">
		<div class="flex justify-end">
			<LightSwitch />
		</div>
	</svelte:fragment>
	<slot />
</AppShell>
