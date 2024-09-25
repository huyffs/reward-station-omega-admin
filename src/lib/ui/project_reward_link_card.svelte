<script lang="ts">
	import RewardCard from '$lib/ui/reward_card.svelte';
	import { useProjectRewardStore, type ProjectReward } from '../store/project_reward_store';
	import { showError, showSuccess } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let projectReward: ProjectReward;
	export let orgId: string;
	export let projectId: string;
	export let rewardId: string;

	const modalStore = getModalStore();
	const projectRewardStore = useProjectRewardStore(orgId, projectId);

	let point = projectReward.point ?? 1;
	let active = projectReward.active !== false;
	let max_mint = projectReward.max_mint || 0;
	let user_mint = projectReward.user_mint || 0;

	async function add() {
		const res = await projectRewardStore.update({
			method: 'POST',
			body: {
				point,
				active,
				max_mint,
				user_mint,
				project_id: projectId,
				reward_id: rewardId,
			},
			id: rewardId,
		});
		if (res.ok) {
			showSuccess('Added successfully!');
			modalStore.close();
		} else {
			showError(`Failed to add: ${res.message}`);
		}
	}

	async function update() {
		const res = await projectRewardStore.update({
			path: rewardId,
			body: { point, active, max_mint, user_mint },
		});
		if (res.ok) {
			showSuccess('Updated successfully!');
			modalStore.close();
		} else {
			showError(`Failed to update: ${res.message}`);
		}
	}

	async function del() {
		const res = await projectRewardStore.delete(rewardId);
		if (res.ok) {
			showSuccess('Deleted successfully!');
			modalStore.close();
		} else {
			showError(`Failed to delete: ${res.message}`);
		}
	}
</script>

<RewardCard
	image={(projectReward.images.length && projectReward.images[0]) || undefined}
	title={projectReward.name}
>
	<div class="label text-center" slot="head">
		<span class="text-surface-400">Supply</span>
		<span>{projectReward.coupon_total || 'Unknown'}</span>
	</div>
	<form on:submit={onsubmit}>
		<label class="label">
			<span>Value</span>
			<input
				name="point"
				type="number"
				min="0"
				bind:value={point}
				placeholder="Enter your project name"
				required
				class="input p-2 text-center"
			/>
		</label>
		<label class="label my-4">
			<div class="flex place-content-between">
				<span>Active</span>
				<input name="active" type="checkbox" bind:checked={active} class="checkbox p-2" />
			</div>
		</label>
		<div class="flex gap-4 my-4">
			<label class="label flex flex-col">
				<span>Max mint</span>
				<input
					name="max_mint"
					type="number"
					min="0"
					bind:value={max_mint}
					placeholder="Max for campaign"
					class="input p-2 text-center"
				/>
			</label>
			<label class="label flex flex-col">
				<span>Pser mint</span>
				<input
					name="user_mint"
					type="number"
					min="0"
					bind:value={user_mint}
					placeholder="Max per user"
					class="input p-2 text-center"
				/>
			</label>
		</div>
		{#if projectReward.project_id}
			<div class="flex place-content-between mt-8">
				<button class="btn variant-ghost-error" type="button" on:click={del}>Remove</button>
				<button class="btn variant-ghost-primary" type="button" on:click={update}>Save</button>
			</div>
		{:else}
			<div class="flex justify-center mt-8">
				<button class="btn variant-ghost-primary" type="button" on:click={add}>Add</button>
			</div>
		{/if}
	</form>
</RewardCard>
