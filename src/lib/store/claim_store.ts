import { PUBLIC_API_URL_PREFIX } from '$env/static/public';
import { auth } from '$lib/firebase';
import { writable } from 'svelte/store';
import { doFetch } from './async_store';

export type ClaimStore = {
	orgs: Record<string, number>;
};

export const claimStore = writable<ClaimStore>({
	orgs: {},
});

auth.onIdTokenChanged(async (u) => {
	if (!u) {
		claimStore.set({ orgs: {} });
		return;
	}
	const idResult = await u.getIdTokenResult();
	claimStore.set({
		orgs: (idResult.claims.a || {}) as Record<string, number>,
	});
});

export async function acceptInvitation(id: string) {
	const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/cm/grant/${id}`);
	if (!res.ok) {
		console.error('Error accept invitation:', await res.text());
	}
	return res.ok;
}
