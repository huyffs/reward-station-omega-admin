<script lang="ts">
	import { page } from '$app/stores';
	import { orgStore } from '$lib/store/org_store';
	import { onMount } from 'svelte';
	import { derivedById } from '$lib/store/async_store';
	import { showError, showSuccess } from '$lib/util/notif';
	import { auth } from '$lib/firebase';
	import Breadcrumb from '$lib/components/breadcrumb.svelte';

	type Form = {
		uid: string;
	};
	const form: Form = {
		uid: '',
	};

	const org = derivedById(orgStore, $page.params.orgId);

	onMount(() => {
		if (!$org) {
			orgStore.fetchOne($page.params.orgId).catch(showError);
		}
	});

	let inFlight = false;

	async function onGrantFormSubmit() {
		if (!$org) {
			return;
		}
		if (!form.uid) {
			showError('Please enter the admin id');
			return;
		}
		inFlight = true;
		try {
			const admins = {
				...$org.admins,
				[form.uid]: 0x1,
			};

			const res = await orgStore.patch($page.params.orgId, { admins });
			if (res.ok) {
				showSuccess('Invited');
				form.uid = '';
				return;
			}
			showError(`failed to save: ${res.status} ${await res.message}`);
		} catch (err) {
			showError('Error update org info');
		}
		inFlight = false;
	}
</script>

<Breadcrumb />
<main class="max-w-screen-md my-8 text-center mx-auto">
	{#if $org}
		<h1 class="h1">
			{$org.name}
		</h1>
		<div class="m-8">
			<a href="{$org.id}/projects">
				{#if $org.logo}
					<div class="card bg-initial overflow-hidden w-48 mx-auto">
						<header>
							<img
								src={$org.logo}
								alt="logo"
								class="bg-black/50 w-full aspect-square object-cover"
							/>
						</header>
						<section class="p-4">{$org.name}</section>
					</div>
				{:else}
					<div
						class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
					>
						🏞️
					</div>
				{/if}
			</a>
			<a href="{$org.id}/edit" class="btn variant-ghost-primary my-4">✏️ Edit</a>
		</div>

		<div class="card m-8 p-4 w-[28rem] mx-auto text-left">
			<h4 class="h4">Admins</h4>
			<ul class="list my-4">
				{#each Object.keys($org.admins) as uid, i}
					<li>
						<span>{i + 1}.</span>
						{#if uid === auth.currentUser?.uid}
							<span class="flex-auto">{auth.currentUser?.displayName || uid} (you)</span>
						{:else}
							<span class="flex-auto">{uid}</span>
						{/if}
						<span>{$org.admins[uid] === 0xff ? '👷‍♂️' : '🧍🏻'}</span>
					</li>
				{/each}
			</ul>
			<form class="flex gap-2" on:submit|preventDefault={onGrantFormSubmit}>
				<label class="label flex-1 flex items-center gap-2">
					<span>ID</span>
					<input
						name="uid"
						bind:value={form.uid}
						placeholder="E.g. kkoDRmZ3Fthm4tNn661a37yyNJ52"
						class="input p-2"
					/>
				</label>
				<button class="btn variant-filled-primary" disabled={inFlight}>Add</button>
			</form>
		</div>
	{:else}
		Loading...
	{/if}
</main>
