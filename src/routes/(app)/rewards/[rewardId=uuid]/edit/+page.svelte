<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import RewardForm from '$lib/form/reward_form.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { rewardStore } from '$lib/store/reward_store';
	import { showError } from '$lib/util/notif';
	import { onMount } from 'svelte';

	const reward = derivedById(rewardStore, $page.params.rewardId);

	onMount(() => {
		if (!$reward) {
			rewardStore.fetchOne($page.params.rewardId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-sm mx-auto my-8">
	{#if $reward}
		<RewardForm reward={$reward} />
	{:else}
		Loading...
	{/if}
</main>
