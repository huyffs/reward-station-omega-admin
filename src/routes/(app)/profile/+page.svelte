<script lang="ts">
	import { Avatar, getToastStore } from '@skeletonlabs/skeleton';
	import { userStore } from '$lib/store/user_store';
	import { updateProfile } from 'firebase/auth';
	import { fly } from 'svelte/transition';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';

	const toastStore = getToastStore();

	let displayName = $userStore?.user.displayName;
	let isEdit: boolean = false;
	function onSubmit() {
		if (!auth.currentUser) {
			return;
		}
		updateProfile(auth.currentUser, {
			displayName,
		})
			.then(() => {
				isEdit = false;
			})
			.catch((error) => {
				console.error('Error updating user:', error);
			});
	}

	function onSignOutClick() {
		auth
			.signOut()
			.then(() => goto('/'))
			.catch((err) => {
				console.error(err);
				toastStore.trigger({
					message: 'Something went wrong',
					background: 'variant-filled-error',
				});
			});
	}
</script>

<div
	class="flex w-full justify-center items-center flex-grow mt-20"
	in:fly={{ y: 200, duration: 500 }}
>
	<div class="card p-10 h-full flex flex-col justify-center items-center overflow-hidden">
		<div class="flex flex-col items-center">
			<Avatar
				initials={$userStore?.user.displayName
					?.split(' ')
					.map((s) => s.charAt(0))
					.join('') || ''}
			/>
			<h3>{$userStore?.user.email}</h3>
		</div>
		<div class="flex flex-row my-4 w-full">
			{#if !isEdit}
				<div class="row min-w-fit w-full">
					<p>Display Name:</p>
					<p>UID:</p>
				</div>
				<div class="row ml-4 w-full">
					<p class="break-words">{$userStore?.user.displayName}</p>
					<p class="break-words">{$userStore?.user.uid}</p>
				</div>
			{:else}
				<div class="w-full h-full">
					<label class="label">
						<span>Display Name</span>
						<input
							name="name"
							type="name"
							bind:value={displayName}
							placeholder="Enter your display name"
							required
							class="input p-2"
						/>
					</label>
				</div>
			{/if}
		</div>
		<button class="btn variant-outline-error" on:click={onSignOutClick}>Sign out</button>
	</div>
</div>
