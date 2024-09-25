<script lang="ts">
	import { type Org, orgStore } from '$lib/store/org_store';
	import { goto } from '$app/navigation';
	import { showError, showSuccess } from '$lib/util/notif';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { auth } from '$lib/firebase';
	import UploadFrame from '$lib/ui/upload_frame.svelte';

	type Form = {
		name: string;
		logo: string;
		admins: UserPermission[];
	};

	type UserPermission = {
		userId: string;
		permission: number;
	};

	export let org: Org | undefined = undefined;

	const modalStore = getModalStore();
	const form: Form = {
		name: org?.name || '',
		logo: org?.logo || '',
		admins: org?.admins
			? Object.keys(org.admins).map((userId) => ({ userId, permission: org!.admins[userId] }))
			: [],
	};

	let inFlight = false;

	async function onSubmit() {
		inFlight = true;
		const data: Record<string, any> = {
			...form,
			admins: form.admins.reduce(
				(acc, item) => {
					acc[item.userId] = item.permission;
					return acc;
				},
				{} as Record<string, number>,
			),
		};
		if (org) {
			const updateRes = await orgStore.patch(org.id, data);
			if (updateRes.ok) {
				showSuccess();
			} else {
				showError(`${updateRes.status}: ${updateRes.message}`);
			}
		} else {
			const createRes = await orgStore.create(data);
			if (createRes.ok) {
				auth.currentUser?.getIdTokenResult(true);
				goto(createRes.id);
			} else {
				showError(`${createRes.status}: ${createRes.message}`);
			}
		}
		inFlight = false;
	}

	function deleteOrg() {
		if (!org) {
			return;
		}
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete ' + org.name,
			body: 'This will permanently remove the org',
			response(r) {
				if (r && org) {
					orgStore.delete(org.id).then((res) => {
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
</script>

<form on:submit|preventDefault={onSubmit} class="p-4 card">
	{#if org}
		<header class="">
			<UploadFrame bind:image={form.logo} section="org" orgId={org.id} on:update={onSubmit} />
		</header>
	{/if}
	<main class="my-4">
		<label class="label">
			<span>Name</span>
			<input
				name="name"
				bind:value={form.name}
				placeholder="E.g. The Smith's Xmas"
				class="input p-2"
			/>
		</label>
	</main>
	<footer class="flex justify-between gap-4 mt-2">
		<a href="." class="btn variant-ringed">← Back</a>
		<button
			type="button"
			class="btn variant-ringed-error"
			disabled={inFlight || !org}
			on:click={() => deleteOrg()}>Delete</button
		>
		<button class="btn variant-filled-primary" type="submit" disabled={inFlight}>Save</button>
	</footer>
</form>
