<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { rewardStore } from '$lib/store/reward_store';
	import { useCouponStore, type Coupon } from '$lib/store/coupon_store';
	import { showError, showSuccess } from '$lib/util/notif';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import CouponAddForm from '$lib/form/coupon_add_form.svelte';
	import ImageGallery from '$lib/ui/image_gallery.svelte';

	const modalStore = getModalStore();

	const reward = derivedById(rewardStore, $page.params.rewardId);
	const couponStore = useCouponStore($page.params.rewardId);
	const coupons = derived(couponStore.store, ($couponStore) => {
		return Object.values($couponStore).sort((a, b) => {
			if (b.mintedAt) {
				if (a.mintedAt) {
					return b.mintedAt.getTime() - a.mintedAt.getTime();
				} else {
					return 1;
				}
			} else if (a.mintedAt) {
				return -1;
			} else {
				return 0;
			}
		});
	});

	$: numMinted = $coupons.reduce((acc, coupon) => {
		if (coupon.user_id) {
			acc++;
		}
		return acc;
	}, 0);

	onMount(() => {
		const couponStore = useCouponStore($page.params.rewardId);
		couponStore.fetchAll().catch(showError);
		if (!$reward) {
			rewardStore.fetchOne($page.params.rewardId).catch(showError);
		}
	});

	function handleCouponClick(coupon: Coupon) {
		modalStore.trigger({
			type: 'prompt',
			body: 'Coupon URL',
			value: coupon.url,
			buttonTextSubmit: 'Save',
			response: async (url: string) => {
				if (!url) {
					return;
				}
				if (url.substring(0, 8) !== 'https://') {
					showError(`Invalid URL`);
					return;
				}
				const res = await couponStore.patch(`${coupon.reward_id}/${coupon.number}`, { url });
				if (res.ok) {
					showSuccess('Coupon URL updated');
				} else {
					showError(`Failed to update coupon: ${res.message}`);
				}
			},
		});
	}

	function onAddCouponClick() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: CouponAddForm,
			},
			response: async (urls: string[]) => {
				const res = await couponStore.create({ reward_id: $page.params.rewardId, urls });
				if (res.ok) {
					showSuccess('Coupons added');
					modalStore.clear();
				} else {
					showError(`Failed to add coupons: ${res.message}`);
				}
			},
		});
	}
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto">
	{#if $reward}
		<div class="flex gap-8 items-center">
			<h1 class="h1">
				{$reward.name}
			</h1>
			<a href="{$reward.id}/edit" class="btn variant-ringed-primary hover:variant-ghost-primary"
				>✏️ Edit</a
			>
		</div>

		<h4 class="h4 mt-8 mb-2">Images</h4>
		<ImageGallery images={$reward.images} />

		{#if $reward.description}
			<h4 class="h4 mt-8 mb-2">Description</h4>
			<p>{$reward.description}</p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Coupons</h4>
		<div class="flex justify-center">
			<div class="flex gap-1 items-center border border-primary-500">
				<span class="px-2">Minted</span>
				<span class="text-2xl badge variant-filled-primary">{numMinted}/{$coupons.length}</span>
			</div>
		</div>

		<ul class="my-8 flex justify-center flex-wrap gap-4">
			{#each $coupons as coupon}
				<li>
					<button
						on:click={() => handleCouponClick(coupon)}
						class="btn p-4"
						class:variant-ghost-primary={!coupon.user_id}
						class:variant-ghost-warning={coupon.user_id}>{coupon.number}</button
					>
				</li>
			{/each}
		</ul>
		<div class="text-center my-12">
			<button class="btn variant-ghost-primary" on:click={onAddCouponClick}>
				<span>＋</span>
				<span>Add coupons</span>
			</button>
		</div>
	{:else}
		Loading...
	{/if}
</main>
