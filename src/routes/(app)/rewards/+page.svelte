<script lang="ts">
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { sortByName } from '$lib/store/async_store';
	import { rewardStore } from '$lib/store/reward_store';
	import LinkCard from '$lib/ui/link_card.svelte';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const rewards = derived(rewardStore.store, ($rewardStore) => {
		return Object.values($rewardStore).sort(sortByName);
	});

	onMount(() => {
		rewardStore.fetchAll().catch(showError);
	});
</script>

<Breadcrumb />

<main class="max-w-screen-md my-8 mx-auto">
	<div class="flex gap-8 items-center">
		<h1 class="h1">All Rewards</h1>
		<a href="rewards/new" class="btn variant-ringed-secondary hover:variant-ghost-secondary">
			<span>＋</span>
			<span>New reward</span>
		</a>
	</div>
	<nav class="my-8 flex justify-center flex-wrap gap-4">
		{#each $rewards as reward}
			<LinkCard
				href="rewards/{reward.id}"
				text={reward.name}
				image={(reward.images.length && reward.images[0]) || undefined}
			/>
		{/each}
	</nav>
	<div class="text-center my-12">
		<a href="rewards/new" class="btn variant-ghost-primary">
			<span>＋</span>
			<span>New reward</span>
		</a>
	</div>
</main>
