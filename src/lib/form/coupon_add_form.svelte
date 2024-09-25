<script lang="ts" context="module">
	type CouponFormData = {
		urls: string;
		dedupe: boolean;
	};
</script>

<script lang="ts">
	import { showError } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let data: CouponFormData = {
		urls: '',
		dedupe: true,
	};

	const modalStore = getModalStore();

	function onSubmit() {
		let urls = data.urls.split('\n').filter((url) => !!url);
		const invalid = urls.find((url) => {
			return url.substring(0, 8) !== 'https://';
		});
		if (invalid) {
			showError(`Invalid coupon URL: ${invalid}`);
			return;
		}
		if (data.dedupe) {
			urls = Object.keys(
				urls.reduce(
					(acc, url) => {
						acc[url] = undefined;
						return acc;
					},
					{} as Record<string, undefined>,
				),
			);
		}
		$modalStore[0]?.response!(urls);
	}
</script>

<form on:submit|preventDefault={onSubmit} class="p-4 card w-full">
	<header>Coupon</header>
	<main class="p-4">
		<label class="label">
			<span>Coupon URLs</span>
			<textarea
				name="urls"
				bind:value={data.urls}
				placeholder="e.g.
https://reward.metadomo.com/coupon-0
https://reward.metadomo.com/coupon-1
https://reward.metadomo.com/coupon-2
"
				rows="20"
				required
				class="textarea p-2"
			/>
		</label>
		<label class="label">
			<span class="mr-4">Remove duplicates</span>
			<input type="checkbox" bind:checked={data.dedupe} />
		</label>
	</main>
	<footer class="flex justify-between gap-4">
		<button class="btn variant-ghost-error" type="button" on:click={modalStore.close}>Cancel</button
		>
		<button class="btn variant-filled-primary" type="submit">Done</button>
	</footer>
</form>
