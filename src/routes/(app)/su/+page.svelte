<script lang="ts">
	import { doFetch } from '$lib/store/async_store';
	import { showError, showSuccess } from '$lib/util/notif';
	import { PUBLIC_API_URL_PREFIX } from '$env/static/public';

	type Form = {
		uid: string;
	};
	const form: Form = {
		uid: '',
	};

	let inFlight = false;

	async function onInitPressed() {
		inFlight = true;
		try {
			const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/su/init`, {
				method: 'POST',
			});
			if (res.ok) {
				showSuccess('Granted SU to yourself');
				form.uid = '';
				return;
			}
			showError(`failed to save: ${res.status} ${await res.text()}`);
		} catch (err) {
			showError('Error update org info');
		}
		inFlight = false;
	}

	async function onGrantFormSubmit() {
		if (!form.uid) {
			showError('Please enter the admin id');
			return;
		}
		inFlight = true;
		try {
			const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/su/grant`, {
				method: 'POST',
				body: JSON.stringify({
					user_id: form.uid,
					level: 1,
				}),
			});
			if (res.ok) {
				showSuccess('Granted SU');
				form.uid = '';
				return;
			}
			showError(`failed to save: ${res.status} ${await res.text()}`);
		} catch (err) {
			showError('Error update org info');
		}
		inFlight = false;
	}
</script>

<div class="card m-8 p-4 w-[28rem] mx-auto text-left">
	<button
		class="btn variant-outline-primary hover:variant-ghost-primary mx-auto block mb-8"
		on:click={onInitPressed}>Init</button
	>
	<h4 class="h4">Grant Super Admin</h4>
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
