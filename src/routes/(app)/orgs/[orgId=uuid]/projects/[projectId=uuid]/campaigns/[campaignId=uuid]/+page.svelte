<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { CHAINS } from '$lib/form/campaign_form.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { useCampaignStore } from '$lib/store/campaign_store';
	import { useProjectStore } from '$lib/store/project_store';
	import ImageGallery from '$lib/ui/image_gallery.svelte';
	import { showError } from '$lib/util/notif';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import dayjs from 'dayjs';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	dayjs.extend(localizedFormat);

	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);
	const chain = derived(campaign, ($campaign) =>
		$campaign ? CHAINS.find((c) => c.id === $campaign.chain_id) : undefined,
	);

	onMount(() => {
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
	});
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 mx-auto p-4">
	{#if $campaign}
		<div class="flex gap-8 items-center">
			<h1 class="h1">
				{$campaign.name}
			</h1>
			<a href="{$campaign.id}/edit" class="btn variant-ringed-primary hover:variant-ghost-primary"
				>✏️ Edit</a
			>
			<a
				href="{$campaign.id}/engagements"
				class="btn variant-ringed-tertiary hover:variant-ghost-tertiary">Engagements</a
			>
			<a
				href="{$campaign.id}/rewards"
				class="btn variant-ringed-secondary hover:variant-ghost-secondary">Rewards</a
			>
		</div>

		<h4 class="h4 mt-8 mb-2">Logo</h4>
		{#if $campaign.logo}
			<div class="w-48">
				<img
					src={$campaign.logo}
					alt="logo"
					class="bg-black/50 w-full aspect-square object-cover"
				/>
			</div>
		{:else}
			<div class="snap-center shrink-0 card w-40 h-40 flex justify-center items-center text-9xl">
				🏞️
			</div>
		{/if}

		<h4 class="h4 mt-8 mb-2">Images</h4>
		<ImageGallery images={$campaign.images} />

		<h4 class="h4 mt-8 mb-2">Description</h4>
		{#if $campaign.description}
			<p>{$campaign.description}</p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Web 3</h4>
		<p>
			<span>Chain:</span>
			<span>{$chain?.name || ''} ({$campaign.chain_id})</span>
		</p>
		<p><span>Contract Addr:</span> <span>{$campaign.contract_address}</span></p>

		<h4 class="h4 mt-8 mb-2">Mezzofy</h4>
		{#if $campaign.coupon_code}
			<p><span>Coupon code:</span> <span>{$campaign.coupon_code}</span></p>
		{:else}
			<p><span>Coupon code not set</span></p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Engage</h4>
		{#if $campaign.condition_info}
			<p><span>Condition:</span> <span>{$campaign.condition_info}</span></p>
		{/if}
		{#if $campaign.reward_info}
			<p><span>Reward:</span> <span>{$campaign.reward_info}</span></p>
		{/if}

		<h4 class="h4 mt-8 mb-2">Schedule</h4>
		{#if $campaign.startAt}
			<p><span>Start:</span> <span>{dayjs($campaign.startAt).format('llll')}</span></p>
		{/if}
		<p>
			<span>End:</span>
			<span>{$campaign.endAt ? dayjs($campaign.endAt).format('llll') : 'Not set'}</span>
		</p>

		<h4 class="h4 mt-8 mb-2">Tasks</h4>
		{#if $campaign.tasks.length}
			<div>
				<Accordion>
					{#each $campaign.tasks as task}
						<AccordionItem>
							<svelte:fragment slot="lead">📋</svelte:fragment>
							<svelte:fragment slot="summary">{task.name}</svelte:fragment>
							<svelte:fragment slot="content">
								<p>{task.description}</p>
								{#if task.link}
									<a href={task.link} class="anchor">{task.link}</a>
								{/if}
							</svelte:fragment>
						</AccordionItem>
					{/each}
				</Accordion>
			</div>
		{/if}
	{:else}
		Loading...
	{/if}
</main>
