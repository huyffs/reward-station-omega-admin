<script lang="ts" context="module">
	import { page } from '$app/stores';
	import type { Task } from '$lib/store/campaign_store';
	import dayjs from 'dayjs';
	export type Chain = {
		id: number;
		name: string;
		network: string;
		testnet?: boolean;
	};

	export const CHAINS: Chain[] = [
		{
			id: 1,
			name: 'Ethereum',
			network: 'Ethereum',
		},
		{
			id: 11155111,
			name: 'Sepolia Testnet',
			network: 'Ethereum',
			testnet: true,
		},
		{
			id: 5,
			name: 'Goerli Testnet',
			network: 'Ethereum',
			testnet: true,
		},
		{
			id: 16,
			name: 'Optimism',
			network: 'Optimism',
		},
		{
			id: 100,
			name: 'Gnosis Chain',
			network: 'Gnosis',
		},
		{
			id: 420,
			name: 'Optimism Goerli Testnet',
			network: 'Optimism',
			testnet: true,
		},
		{
			id: 42161,
			name: 'Arbitrum One',
			network: 'Arbitrum',
		},
		{
			id: 421613,
			name: 'Arbitrum One Goerli Testnet',
			network: 'Arbitrum',
			testnet: true,
		},
		{
			id: 137,
			name: 'Polygon',
			network: 'Polygon',
		},
		{
			id: 80001,
			name: 'Polygon Mumbai Testnet',
			network: 'Polygon',
			testnet: true,
		},
		{
			id: 592,
			name: 'Astar',
			network: 'Astar',
		},
		{
			id: 1101,
			name: 'Polygon zkEVM',
			network: 'Polygon',
		},
		{
			id: 1422,
			name: 'Polygon zkEVM Testnet',
			network: 'Polygon',
			testnet: true,
		},
		{
			id: 8453,
			name: 'Base',
			network: 'Base',
		},
		{
			id: 84531,
			name: 'Base Goerli Testnet',
			network: 'Base',
			testnet: true,
		},
	];

	const MAINNETS = CHAINS.filter((c) => !c.testnet);
	const TESTNETS = CHAINS.filter((c) => !!c.testnet);

	export type Form = {
		project_id: string;
		name: string;
		description: string;
		coupon_code: string;
		logo?: string;
		images: string[];
		budget: Big | number;
		chain_id: number;
		contract_address: string;
		condition_info: string;
		reward_amount: Big | number;
		reward_info: string;
		tasks: Task[];
		start_at: string;
		end_at?: string;
		voucher_policy: number;
		voucher_expire_at?: string;
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import UploadGallery from '$lib/ui/upload_gallery.svelte';
	import { showError, showSuccess } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { useCampaignStore, type Campaign } from '$lib/store/campaign_store';
	import { auth } from '$lib/firebase';
	import UploadFrame from '$lib/ui/upload_frame.svelte';
	import type { Big } from 'big.js';
	import TaskForm from '$lib/form/task_form.svelte';

	export let orgId: string;
	export let projectId: string;
	export let campaign: Campaign | undefined = undefined;

	type TaskForm = {
		name: string;
		description: string;
		link: string;
		point: number;
	};

	const modalStore = getModalStore();
	const campaignStore = useCampaignStore(orgId, projectId);
	const form: Form = {
		project_id: projectId,
		name: campaign?.name || '',
		logo: campaign?.logo,
		images: campaign?.images ? [...campaign.images] : [],
		description: campaign?.description || '',
		coupon_code: campaign?.coupon_code || '',
		budget: campaign?.budget || 0,
		chain_id: campaign?.chain_id || 1,
		contract_address: campaign?.contract_address || '',
		condition_info: campaign?.condition_info || '',
		reward_amount: campaign?.reward_amount || 0,
		reward_info: campaign?.reward_info || '',
		tasks: campaign?.tasks || [],
		start_at: dayjs(campaign?.startAt).toISOString().substring(0, 10),
		end_at: campaign?.endAt ? dayjs(campaign?.endAt).toISOString().substring(0, 10) : '',
		voucher_policy: campaign?.voucherPolicy || 1,
		voucher_expire_at: campaign?.voucherExpireAt
			? dayjs(campaign?.voucherExpireAt).toISOString().substring(0, 10)
			: '',
	};

	let taskForm: TaskForm = blankTaskForm();

	function blankTaskForm() {
		return {
			name: '',
			description: '',
			link: '',
			point: 0,
		};
	}

	let inFlight = false;

	async function onSubmit() {
		if (!auth.currentUser) {
			showError('Please sign in');
			return;
		}
		if (!form.name) {
			showError('Name is required');
		}
		const data = {
			...form,
			end_at: form.end_at || undefined,
			voucher_expire_at: form.voucher_expire_at || undefined,
			project_id: projectId,
		};
		inFlight = true;
		if (campaign) {
			const updateRes = await campaignStore.put(campaign.id, data);
			if (updateRes.ok) {
				showSuccess();
			} else {
				showError(`${updateRes.status}: ${updateRes.message}`);
			}
		} else {
			const createRes = await campaignStore.create(data);
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

	function trySave() {
		if (auth.currentUser && form.name) {
			return onSubmit();
		}
	}

	function deleteCampaign() {
		if (!campaign) {
			return;
		}
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete ' + campaign.name,
			body: 'This will permanently remove the campaign',
			response(r) {
				if (r && campaign) {
					campaignStore.delete(campaign.id).then((res) => {
						if (res.ok) {
							showSuccess('Deleted sucessfully!');
							goto('..');
						} else {
							showError(`Failed to delete: ${res.message}`);
						}
					});
				}
			},
		});
	}

	function onAddTaskClick() {
		if (!taskForm.name) {
			showError('Title is required');
			return;
		}
		if (!taskForm.description) {
			showError('Description is required');
			return;
		}
		form.tasks = [
			...form.tasks,
			{
				...taskForm,
				id: (new Date().getTime() - 1704067200000).toString(36),
				images: [],
			},
		];
		taskForm = blankTaskForm();
	}

	function onEditTaskClick(index: number) {
		const task: Task = form.tasks[index];
		const props = {
			orgId: $page.params.orgId,
			projectId: $page.params.projectId,
			campaignId: $page.params.campaignId,
			task: { ...task },
		};
		modalStore.trigger({
			type: 'component',
			component: {
				ref: TaskForm,
				props,
			},
			response: (task: Task) => {
				form.tasks[index] = task;
			},
		});
	}

	function deleteTaskAt(index: number) {
		const tasks = [...form.tasks];
		tasks.splice(index, 1);
		form.tasks = tasks;
	}

	let chains = CHAINS.find((c) => c.id === form.chain_id)?.testnet ? TESTNETS : MAINNETS;

	function onToggleNetwork(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = event.currentTarget;
		const currentNetwork = chains.find((c) => c.id === form.chain_id)!;
		chains = input.checked ? TESTNETS : MAINNETS;
		const newNetwork =
			chains.find(
				(c) => c.network === currentNetwork.network && c.testnet !== currentNetwork.testnet,
			) || chains[0];
		form.chain_id = newNetwork.id;
	}
</script>

<form on:submit|preventDefault={onSubmit} class="p-4 card">
	{#if campaign}
		<header class="">
			<div class="label">Logo</div>
			<UploadFrame
				section="campaign"
				bind:image={form.logo}
				{orgId}
				{projectId}
				campaignId={campaign?.id}
				on:update={trySave}
			/>
			<hr class="my-8" />
			<div class="label">Gallery</div>
			<UploadGallery
				bind:images={form.images}
				section="campaign"
				{orgId}
				{projectId}
				campaignId={campaign?.id}
				on:update={trySave}
			/>
		</header>
	{/if}
	<main class="mt-4 mb-24">
		<label class="label my-4">
			<span>Name</span>
			<input
				name="name"
				bind:value={form.name}
				placeholder="E.g. Luna Campaign"
				required
				class="input p-2"
			/>
		</label>
		<label class="label my-4">
			<span>Description</span>
			<textarea
				name="description"
				bind:value={form.description}
				rows="6"
				placeholder="Describe your campaign"
				required
				class="textarea p-2"
			/>
		</label>
		<div class="flex my-4">
			<label class="label flex-1">
				<span>Network</span>
				<select class="select" name="chain_id" bind:value={form.chain_id}>
					{#each chains as chain}
						<option value={chain.id}>{chain.name} ({chain.id})</option>
					{/each}
				</select>
			</label>
			<label class="label flex flex-col justify-center px-4">
				<span>Testnets</span>
				<input
					class="checkbox"
					type="checkbox"
					on:change={onToggleNetwork}
					checked={chains === TESTNETS}
				/>
			</label>
		</div>
		<label class="label my-4">
			<span>Contract address</span>
			<input
				name="contract_address"
				bind:value={form.contract_address}
				placeholder="Enter your contract address"
				required
				class="input p-2"
			/>
		</label>
		<div class="flex gap-4">
			<label class="flex-1 date my-4">
				<span>Start</span>
				<input name="start" type="date" bind:value={form.start_at} class="input p-2" />
			</label>
			<label class="flex-1 date my-4">
				<span>End</span>
				<input name="end" type="date" bind:value={form.end_at} class="input p-2" />
			</label>
		</div>
		<label class="label my-4">
			<span>Condition</span>
			<input
				name="condition_info"
				bind:value={form.condition_info}
				placeholder="Enter your campaign condition info"
				required
				class="input p-2"
			/>
		</label>
		<label class="label my-4">
			<span>Mezzofy coupon code</span>
			<input
				name="coupon_code"
				bind:value={form.coupon_code}
				placeholder="E.g. 1040528"
				class="input p-2"
			/>
		</label>
		{#if form.coupon_code}
			<label class="label my-4">
				<span>Mezzofy coupon Info</span>
				<textarea
					name="reward_info"
					rows="6"
					bind:value={form.reward_info}
					placeholder="Enter your campaign reward info"
					class="textarea p-2"
				/>
			</label>
		{/if}
		<div class="flex gap-4">
			<label class="label my-4">
				<span>Point reward policy</span>
				<select class="select" name="voucher_policy" bind:value={form.voucher_policy}>
					<option value={1}>Task approval</option>
					<option value={2}>Campaign completion</option>
					<option value={3}>Campaign end</option>
					<option value={0}>Manual</option>
				</select>
			</label>
			<label class="date my-4">
				<span>Point expiry</span>
				<input
					name="voucher_espire_at"
					type="date"
					bind:value={form.voucher_expire_at}
					class="input p-2"
				/>
			</label>
		</div>
		<h2 class="h2 my-6">Tasks</h2>
		<ul class="list">
			{#each form.tasks as task, index}
				<li>
					<span>📋</span>
					<span class="flex-auto">{task.name}</span>
					<span>{task.point || '0'} points</span>
					<button class="icon-btn" type="button" on:click={() => onEditTaskClick(index)}>✏️</button>
					<button class="icon-btn" type="button" on:click={() => deleteTaskAt(index)}>❌</button>
				</li>
			{/each}
		</ul>
		<section class="card p-2 m-2 shadow">
			<h4 class="h4">New task</h4>
			<label class="label">
				<span>Title</span>
				<input name="name" bind:value={taskForm.name} placeholder="Short title" class="input p-2" />
			</label>
			<label class="label">
				<span>Description</span>
				<textarea
					class="textarea p-2"
					rows="4"
					name="description"
					bind:value={taskForm.description}
					placeholder="Long description"
				/>
			</label>
			<label class="label">
				<span>Reward point</span>
				<input
					name="point"
					type="number"
					bind:value={taskForm.point}
					placeholder="Points to reward"
					class="input p-2"
				/>
			</label>
			<label class="label">
				<span>Link</span>
				<input
					name="link"
					bind:value={taskForm.link}
					placeholder="URL to the task"
					class="input p-2"
				/>
			</label>
			<div class="text-center m-4">
				<button class="btn variant-filled-secondary mx-auto" type="button" on:click={onAddTaskClick}
					>Add task</button
				>
			</div>
		</section>
	</main>

	<footer
		class="w-full bg-surface-500 p-4 flex justify-between gap-4 mt-16 fixed bottom-0 right-0 shadow-[0_-16px_32px_-16px_rgba(0,0,0,0.3)]"
	>
		<a href="." class="btn variant-ringed">← Back</a>
		<button
			type="button"
			class="btn variant-ringed-error"
			disabled={inFlight || !campaign}
			on:click={() => deleteCampaign()}>Delete</button
		>
		<button class="btn variant-filled-primary" type="submit" disabled={inFlight}>Save</button>
	</footer>
</form>
