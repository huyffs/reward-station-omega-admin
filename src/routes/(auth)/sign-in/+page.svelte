<script lang="ts">
	import { signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { setUser } from '$lib/store/user_store';
	import { fly } from 'svelte/transition';
	import { auth } from '$lib/firebase';

	type Field = {
		error?: string;
		value: string;
	};

	type Form = {
		email: Field;
		password: Field;
	};

	let form: Form = {
		email: { value: '' },
		password: { value: '' },
	};

	const toastStore = getToastStore();

	async function onSubmit(event: SubmitEvent) {
		if (form.password.value.length < 8) {
			form.password.error = 'Password is too short';
			toastStore.trigger({
				message: 'Password is too short',
				background: 'variant-filled-error',
			});
			return;
		}

		try {
			const creds = await signInWithEmailAndPassword(auth, form.email.value, form.password.value);
			setUser(creds.user);
			toastStore.trigger({
				message: 'Sign in successful!',
				background: 'variant-filled-success',
			});

			goto('/', { invalidateAll: true });
		} catch (err: any) {
			const error: AuthError = err;
			let message: string;
			switch (error.code) {
				case 'auth/wrong-password':
					message = 'Your email/password is incorrect';
					break;
				default:
					message = `Error: ${err}`;
			}

			toastStore.trigger({
				message,
				background: 'variant-filled-error',
				hoverable: true,
			});
		}
	}
</script>

<div class="flex justify-center items-center h-full flex-grow" in:fly={{ y: 200, duration: 500 }}>
	<div class="card p-10">
		<div class="flex flex-col items-center">
			<h2>Login</h2>
			<p>Login with email and password</p>
		</div>
		<div class="flex flex-col w-full mt-4">
			<form on:submit|preventDefault={onSubmit} method="POST" class="flex flex-col">
				<label class="label">
					<span>Email</span>
					<input
						name="email"
						type="email"
						bind:value={form.email.value}
						placeholder="Enter your email"
						required
						class="input p-2"
						class:input-error={form.email.error}
					/>
				</label>
				<label>
					<span>Password</span>
					<input
						name="password"
						type="password"
						bind:value={form.password.value}
						placeholder="Enter your password"
						required
						class="input p-2"
						class:input-error={form.password.error}
					/>
				</label>
				<div class="flex justify-between items-center py-5">
					<a href="/reset-password">Reset password</a>
					<button class="btn bg-primary-500">Submit</button>
				</div>
				<hr />
				<a href={'/sign-up'} class="text-center p-5">Sign up</a>
			</form>
			<div id="recaptcha-container" class="justify-center flex" />
		</div>
	</div>
</div>
