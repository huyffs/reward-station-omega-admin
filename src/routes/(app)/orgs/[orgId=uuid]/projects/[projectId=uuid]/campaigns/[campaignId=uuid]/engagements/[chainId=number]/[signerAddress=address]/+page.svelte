<script lang="ts">
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	import { onMount } from 'svelte';
	import { useCampaignStore, type Task } from '$lib/store/campaign_store';
	import { useEngagementStore, type Engagement } from '$lib/store/engagement_store';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';
	import { derivedById } from '$lib/store/async_store';
	import { orgStore } from '$lib/store/org_store';
	import { showError, showSuccess } from '$lib/util/notif';
	import { useProjectStore } from '$lib/store/project_store';
	import type { Writable } from 'svelte/store';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	dayjs.extend(localizedFormat);
	const org = derivedById(orgStore, $page.params.orgId);
	const projectStore = useProjectStore($page.params.orgId);
	const project = derivedById(projectStore, $page.params.projectId);
	const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
	const campaign = derivedById(campaignStore, $page.params.campaignId);
	const engagementStore = useEngagementStore($page.params.orgId, $page.params.campaignId);
	const engagementId = `${$page.params.campaignId}/${$page.params.chainId}/${$page.params.signerAddress}`;
	const engagement = derivedById(engagementStore, engagementId);

	let inFlight = false;

	onMount(() => {
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
		if (!$project) {
			projectStore.fetchOne($page.params.projectId).catch(showError);
		}
		if (!$campaign) {
			campaignStore.fetchOne($page.params.campaignId).catch(showError);
		}
		if (!$engagement) {
			engagementStore.fetchOne(engagementId).catch(showError);
		}
	});

	async function setTaskApproved(task: Task, approved: boolean): Promise<void> {
		if (!$engagement) {
			showError('Data not yet loaded');
			return;
		}
		inFlight = true;
		const res = await engagementStore.update({
			path: engagementId,
			body: {
				accepted: {
					[task.id]: approved,
				},
			},
			customUpdater: (
				store: Writable<Record<string, Engagement>>,
				id: string,
				data: Record<string, any>,
			) => {
				store.update((s) => {
					const item = s[id] || {};
					const accepted = { ...item.accepted, [task.id]: approved };
					s[id] = {
						...item,
						accepted,
						updatedAt: data.updated_at ? new Date(data.updated_at ?? item.updatedAt) : undefined,
						approved: Object.values(accepted).filter((isAccepted) => isAccepted).length,
					};
					return s;
				});
			},
		});
		if (res.ok) {
			let message = approved ? 'Approved' : 'Unapproved';
			if (task.point && task.point > 0) {
				message += `, ${task.point} points ${approved ? 'awarded' : 'deducted'}`;
			}
			showSuccess(message);
		} else {
			showError(`${res.status}: ${res.message}`);
		}
		inFlight = false;
	}

	async function onIssueCouponClick() {
		if (!$engagement) {
			showError('Data not yet loaded');
			return;
		}
		const res = await engagementStore.update({
			path: `${engagementId}/${$engagement.coupon_issue_id ? 'commit' : 'issue'}`,
			id: engagementId,
			method: 'POST',
		});
		if (res.ok) {
			showSuccess($engagement.coupon_issue_id ? 'Committed' : 'Issued');
		} else {
			showError(`${res.status}: ${res.message}`);
		}
	}

	async function onCouponUrlSubmit(
		event: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		},
	) {
		const couponUrl = event.currentTarget.coupon_url.value as string;
		if (!couponUrl.startsWith('https://')) {
			showError(`Invalid coupon URL`);
			return;
		}
		const res = await engagementStore.update({
			path: engagementId + '/coupon',
			body: {
				coupon_url: couponUrl,
			},
			id: engagementId,
		});
		if (res.ok) {
			showSuccess('Coupon updated');
		} else {
			showError(`${res.status}: ${res.message}`);
		}
	}

	async function onDeleteCouponUrlClick() {
		engagementStore
			.deleteProp(engagementId, 'coupon_url')
			.then(() => showSuccess('Coupon updated'))
			.catch((err) => showError(err));
	}

	async function onDeleteCouponSerialClick() {
		engagementStore
			.deleteProp(engagementId, 'coupon_serial')
			.then(() => showSuccess('Coupon un-committed'))
			.catch((err) => showError(err));
	}

	async function onDeleteCouponIssueIdClick() {
		engagementStore
			.deleteProp(engagementId, 'coupon_issue_id')
			.then(() => showSuccess('Coupon un-issued'))
			.catch((err) => showError(err));
	}

	$: engagements = $campaign?.tasks.map((task) => {
		const s = $engagement.submissions[task.id];
		return {
			...task,
			submission: s?.message || s?.link || s?.images?.length ? s : undefined,
			accepted: !!$engagement.accepted[task.id],
		};
	});
</script>

<Breadcrumb />
<main class="p-4">
	{#if $campaign && $engagement}
		<section>
			<h1 class="h1">Engagement</h1>
			<p class="text-surface-500 my-2">ID: {engagementId}</p>
			<h2 class="h2 my-2">Name: {$engagement.user_name}</h2>
			<div class="flex gap-4">
				<div class="flex gap-1 items-center border border-primary-500">
					<span class="px-2">Completed</span>
					<span class="text-2xl badge variant-filled-primary"
						>{$engagement.submitted}/{$campaign.tasks.length}</span
					>
				</div>
				<div class="flex gap-1 items-center border border-primary-500">
					<span class="px-2">Approved</span>
					<span class="text-2xl badge variant-filled-primary"
						>{$engagement.approved}/{$campaign.tasks.length}</span
					>
				</div>
			</div>
			<!-- <p>
				Tasks approved: {Object.values($engagement.accepted).filter((accepted) => accepted).length}
			</p> -->
			<hr class="my-4" />
			<Accordion>
				{#each engagements as engage}
					<AccordionItem open={!engage.accepted}>
						<svelte:fragment slot="lead"
							>{#if engage.accepted}✅{:else if engage.submission}👋{:else}🤷🏼‍♂️{/if}</svelte:fragment
						>
						<svelte:fragment slot="summary">{engage.name}</svelte:fragment>
						<svelte:fragment slot="content">
							<div class="card">
								<div class="card-header flex gap-4 justify-between pb-4">
									<div class="flec-auto">
										<div class="flex">
											<span class="w-24">Response:</span>
											<span class="flex-1">
												{#if engage.submission?.message}
													{engage.submission.message}
												{:else}
													--
												{/if}
											</span>
										</div>
										<div class="flex">
											<span class="w-24">Link:</span>
											{#if engage.submission?.link}
												<a href={engage.submission.link} class="anchor" target="_blank"
													>{engage.submission.link}</a
												>
											{:else}
												--
											{/if}
										</div>
									</div>
									<div>
										{#if engage.accepted}
											<button
												type="button"
												class="btn variant-ghost-error"
												disabled={inFlight}
												on:click={() => setTaskApproved(engage, false)}>Unapprove</button
											>
										{:else}
											<button
												type="button"
												disabled={inFlight}
												class="btn variant-ghost-primary"
												class:variant-ghost-error={!engage.submission}
												on:click={() => setTaskApproved(engage, true)}>Approve</button
											>
										{/if}
									</div>
								</div>
								{#if engage.submission?.images?.length}
									<div class="flex flex-wrap gap-4 justify-center p-4">
										{#each engage.submission.images || [] as img}
											<a
												href={img}
												target="_blank"
												class="border border-transparent hover:border-primary-500"
											>
												<img
													src={img}
													alt="Evidence image for task {engage.id}"
													class="w-48 h-48 aspect-square object-cover"
												/>
											</a>
										{/each}
									</div>
								{/if}
							</div>
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		</section>
		<hr class="my-4" />
		{#if $engagement.approved === $campaign.tasks.length}
			<h2 class="h2">All tasks approved</h2>
			{#if $campaign.coupon_code}
				<section class="card">
					<div class="card-header">
						<h2 class="h2">Mezzofy</h2>
					</div>
					<div class="p-4">
						{#if $engagement.coupon_url}
							<div class="flex gap-8 items-center">
								<h4>Coupon URL</h4>
								<a href={$engagement.coupon_url} target="_blank" class="flex-1 anchor truncate"
									>{$engagement.coupon_url}</a
								>
								<button
									class="btn variant-ringed-error hover:variant-ghost-error"
									on:click={onDeleteCouponUrlClick}>❌ Delete</button
								>
							</div>
						{:else}
							{#if $engagement.coupon_serial}
								<p>Coupon issued and committed</p>
								<button
									class="btn variant-ringed-error hover:variant-ghost-error"
									on:click={onDeleteCouponSerialClick}>❌ Uncommit</button
								>
							{:else if $engagement.coupon_issue_id}
								<p>Coupon issued but not committed</p>
								<button
									class="btn variant-ringed-error hover:variant-ghost-error"
									on:click={onDeleteCouponIssueIdClick}>❌ Unissue</button
								>
								<button class="btn variant-filled-primary" on:click={onIssueCouponClick}
									>Commit now</button
								>
							{:else}
								<button class="btn variant-filled-primary" on:click={onIssueCouponClick}
									>Book coupon</button
								>
							{/if}
							<hr class="my-8" />
							<form on:submit|preventDefault={onCouponUrlSubmit} class="my-8">
								<label>
									<span>Coupon URL</span>
									<input
										name="coupon_url"
										placeholder="e.g. https://g4b.giftee.biz/giftee_boxes/93b6b560-7748-4c74-84bc-5ca62da66d04"
										class="input p-2"
									/>
								</label>
								<button class="btn variant-filled-primary">Submit</button>
							</form>
						{/if}
					</div>
				</section>
			{/if}
		{/if}
	{:else}
		Loading...
	{/if}
</main>
