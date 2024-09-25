<script lang="ts">
	import { goto } from '$app/navigation';
	import UploadGallery from '$lib/ui/upload_gallery.svelte';
	import { showError, showSuccess } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { rewardStore, type Reward } from '$lib/store/reward_store';
	import { auth } from '$lib/firebase';
	import { strDate } from '$lib/store/async_store';

	type Form = {
		name: string;
		description: string;
		images: string[];
		issuer_id?: string;
		category?: number;
		country_id?: number;
		tandc?: string;
		active_from?: string;
		active_until?: string;
		valid_from?: string;
		valid_until?: string;
	};

	export let reward: Reward | undefined = undefined;

	const nowDate = strDate(new Date());

	const modalStore = getModalStore();
	const form: Form = {
		name: reward?.name || '',
		description: reward?.description || '',
		images: reward?.images ? [...reward.images] : [],
		issuer_id: reward?.issuer_id,
		category: reward?.category,
		country_id: reward?.country_id,
		tandc: reward?.tandc || '',
		active_from: strDate(reward?.activeFrom) || nowDate,
		active_until: strDate(reward?.activeUntil) || '',
		valid_from: strDate(reward?.validFrom) || nowDate,
		valid_until: strDate(reward?.validUntil) || '',
	};

	let inFlight = false;

	async function onSubmit() {
		console.log(form);
		if (!auth.currentUser) {
			showError('Please sign in');
			return;
		}
		if (!form.name) {
			showError('Name is required');
		}
		inFlight = true;
		if (reward) {
			const updateRes = await rewardStore.put(reward.id, form);
			if (updateRes.ok) {
				showSuccess();
				goto('.');
			} else {
				showError(`${updateRes.status}: ${updateRes.message}`);
			}
		} else {
			const createRes = await rewardStore.create(form);
			auth.currentUser.getIdTokenResult(true);
			if (createRes.ok) {
				showSuccess();
				goto(createRes.id);
			} else {
				showError(`${createRes.status}: ${createRes.message}`);
			}
		}
		inFlight = false;
	}

	function deleteReward() {
		if (!reward) {
			return;
		}
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete ' + reward.name,
			body: 'This will permanently remove the reward',
			response(r) {
				if (r && reward) {
					rewardStore.delete(reward.id).then((res) => {
						if (res.ok) {
							showSuccess('Deleted sucessfully!');
							goto('..');
						} else {
							showError(`Failed to delete campaign: ${res.message}`);
						}
					});
				}
			},
		});
	}
</script>

<form on:submit|preventDefault={onSubmit} class="p-4 card">
	{#if reward}
		<header class="">
			<div class="label">Gallery</div>
			<UploadGallery
				bind:images={form.images}
				section="reward"
				rewardId={reward.id}
				on:update={onSubmit}
			/>
		</header>
	{/if}
	<main class="my-4">
		<label class="label">
			<span>Name</span>
			<input
				name="name"
				bind:value={form.name}
				placeholder="E.g. Luna Reward"
				required
				class="input p-2"
			/>
		</label>
		<label class="label my-4">
			<span>Description</span>
			<textarea
				name="description"
				bind:value={form.description}
				rows="4"
				placeholder="Description..."
				class="textarea p-2"
			/>
		</label>
		<label class="label my-4">
			<span>T &amp; C</span>
			<textarea
				name="tandc"
				bind:value={form.tandc}
				rows="4"
				placeholder="Terms & Conditions..."
				class="textarea p-2"
			/>
		</label>
		<div class="flex gap-4">
			<label class="label my-4 flex-1">
				<span>Available from</span>
				<input
					name="active_from"
					bind:value={form.active_from}
					placeholder="Start date"
					type="date"
					class="input p-2"
				/>
			</label>
			<label class="label my-4 flex-1">
				<span>Available until</span>
				<input
					name="active_until"
					bind:value={form.active_until}
					placeholder="End date"
					type="date"
					class="input p-2"
				/>
			</label>
		</div>
		<div class="flex gap-4">
			<label class="label my-4 flex-1">
				<span>Valid from</span>
				<input
					name="valid_from"
					bind:value={form.valid_from}
					placeholder="Start date"
					type="date"
					class="input p-2"
				/>
			</label>
			<label class="label my-4 flex-1">
				<span>Valid until</span>
				<input
					name="valid_until"
					bind:value={form.valid_until}
					placeholder="End date"
					type="date"
					class="input p-2"
				/>
			</label>
		</div>
	</main>

	<footer class="flex justify-between gap-4 mt-2">
		<a href="." class="btn variant-ringed">← Back</a>
		<button
			type="button"
			class="btn variant-ringed-error"
			disabled={inFlight || !reward}
			on:click={() => deleteReward()}>Delete</button
		>
		<button class="btn variant-filled-primary" type="submit" disabled={inFlight}>Save</button>
	</footer>
</form>
