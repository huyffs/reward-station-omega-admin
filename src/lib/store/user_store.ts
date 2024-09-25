import { auth } from '$lib/firebase';
import type { User } from 'firebase/auth';
import { writable } from 'svelte/store';

export type UserStore = {
	user: User;
	claims: CustomClaims;
};

export type CustomClaims = {
	admin: number;
	orgs: Record<string, number>;
	wallets: Record<string, boolean>;
};

export const userStore = writable<UserStore | undefined>(undefined);

export async function setUser(u: User | null, forceRefresh: boolean | undefined = undefined) {
	if (!u) {
		userStore.set(undefined);
		return;
	}
	const idResult = await u.getIdTokenResult(forceRefresh);
	const walletClaims = idResult.claims.w as Record<string, boolean>;
	const wallets: Record<string, boolean> = {};
	let permissionNeedsFixing = false;
	for (const k in walletClaims) {
		wallets[k] = walletClaims[k];
		if (!permissionNeedsFixing && k !== k.toLowerCase()) {
			permissionNeedsFixing = true;
		}
	}
	userStore.set({
		user: u,
		claims: {
			admin: (idResult.claims.admin ?? 0) as number,
			orgs: idResult.claims.a as Record<string, number>,
			wallets,
		},
	});
}

auth.authStateReady().then(() => setUser(auth.currentUser));
auth.onAuthStateChanged((user) => setUser(user));
auth.onIdTokenChanged((user) => setUser(user));

export async function refreshIdToken() {
	return setUser(auth.currentUser, true);
}
