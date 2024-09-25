import { PUBLIC_API_URL_PREFIX } from '$env/static/public';
import { auth } from '$lib/firebase';
import { writable, type StartStopNotifier, type Writable, derived } from 'svelte/store';

export type Identifiable = {
	id: string;
};
export type Nameable = {
	name: string;
};

export type Schedulable = {
	createdAt: Date;
	updatedAt?: Date;
};

export type AsyncResult =
	| {
			ok: true;
			status: number;
			id: string;
	  }
	| {
			ok: false;
			status: number;
			message: string;
	  };

export type Query = string | string[][] | Record<string, string> | URLSearchParams | undefined;
export type Data = Identifiable & Record<string, any>;
export type CreateResponse = Identifiable &
	Record<string, any> & {
		created_at: string;
	};
export type UpdateResponse = Record<string, any> & {
	updated_at: string;
};
export type ItemBuilder<T extends Identifiable> = (raw: CreateResponse) => T[];
export type ItemUpdater<T extends Identifiable> = (
	store: Writable<Record<string, T>>,
	id: string,
	data: Record<string, any>,
) => void;
export type AsyncStore<T extends Identifiable> = Record<string, T>;
export type UpdateOpts<T extends Identifiable> = {
	path?: string;
	id?: string;
	body?: Record<string, any>;
	query?: Query;
	method?: 'POST' | 'PATCH' | 'PUT';
	customUpdater?: ItemUpdater<T>;
};
export interface FetchStore<T extends Identifiable> {
	store: Writable<Record<string, T>>;
	fetchOne(id: string): Promise<void>;
	fetchAll(opts?: { path?: string; query?: Query }): Promise<void>;
	create(data: Record<string, any>): Promise<AsyncResult>;
	update(opts: UpdateOpts<T>): Promise<AsyncResult>;
	patch(path: string, body: Record<string, any>): Promise<AsyncResult>;
	put(path: string, body: Record<string, any>): Promise<AsyncResult>;
	delete(path: string, id?: string): Promise<AsyncResult>;
	deleteProp(id: string, prop: keyof T): Promise<void>;
}

function createStore<T extends Identifiable>(
	base: string,
	query?: Query,
	builder: ItemBuilder<T> = defaultBuilder,
	updater: ItemUpdater<T> = defaultUpdater,
	start?: StartStopNotifier<Record<string, T>> | undefined,
): FetchStore<T> {
	const store = writable<Record<string, T>>({} as Record<string, T>, start);
	function makeQueryString(addQuery?: Query): string {
		let q = new URLSearchParams(query);
		if (addQuery) {
			const aq = new URLSearchParams(addQuery);
			aq.forEach((v, k) => {
				q.append(k, v);
			});
		}
		let qq = q.toString();
		if (qq.length) {
			qq = '?' + qq;
		}
		return qq;
	}

	async function fetchOne(id: string): Promise<void> {
		const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/${base}${id ? '/' + id : ''}`);
		if (res.ok) {
			const data: CreateResponse = await res.json();
			addAll(builder(data));
		} else {
			throw Error(`Fetch error: ${res.status} - ${await res.text()}`);
		}
	}
	async function fetchAll({ path, query }: { path?: string; query?: Query } = {}): Promise<void> {
		const p = path ? `${base}/${path}` : base;
		const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/${p}${makeQueryString(query)}`);
		if (res.ok) {
			const items = await res.json<CreateResponse[]>();
			for (const data of items) {
				addAll(builder(data));
			}
		} else {
			throw Error(`Fetch error: ${res.status} - ${await res.text()}`);
		}
	}

	function addAll(data: T[]) {
		store.update((s) => {
			for (const item of data) {
				s[item.id] = item;
			}
			return s;
		});
	}

	async function create(body: Record<string, any>): Promise<AsyncResult> {
		// async function create({ path, body }: { body: Record<string, any>; path?: string }) {
		const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/${base}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		if (res.ok) {
			const data = await res.json<CreateResponse>();
			addAll(builder({ ...body, ...data }));
			return {
				ok: true,
				status: res.status,
				id: data.id,
			};
		}
		return {
			ok: false,
			status: res.status,
			message: await res.text(),
		};
	}
	async function update({
		method = 'PATCH',
		path,
		body,
		query,
		id,
		customUpdater = updater ?? defaultUpdater,
	}: UpdateOpts<T>): Promise<AsyncResult> {
		const init: RequestInit = { method };
		if (body) {
			init.body = JSON.stringify(body);
			init.headers = {
				'Content-Type': 'application/json',
			};
		}
		const res = await doFetch(
			`${PUBLIC_API_URL_PREFIX}/${base}${path ? '/' + path : ''}${makeQueryString(query)}`,
			init,
		);
		if (res.ok) {
			const data = await res.json<UpdateResponse>();
			customUpdater(store, id || path || '', { ...body, ...data });
			return {
				ok: true,
				status: res.status,
				id: id || path || '',
			};
		}
		return {
			ok: false,
			status: res.status,
			message: await res.text(),
		};
	}

	async function del(path: string, id?: string): Promise<AsyncResult> {
		const res = await doFetch(`${PUBLIC_API_URL_PREFIX}/${base}/${path}${makeQueryString()}`, {
			method: 'DELETE',
		});
		if (res.ok) {
			store.update((s) => {
				const ss = { ...s };
				delete ss[id || path];
				return ss;
			});
			return {
				ok: true,
				status: res.status,
				id: id || path,
			};
		}
		return {
			ok: false,
			status: res.status,
			message: await res.text(),
		};
	}

	async function deleteProp(id: string, prop: keyof T): Promise<void> {
		const res = await doFetch(
			`${PUBLIC_API_URL_PREFIX}/${base}/${id}/${String(prop)}${makeQueryString()}`,
			{
				method: 'DELETE',
			},
		);
		if (res.ok) {
			const data = await res.json<UpdateResponse>();
			store.update((s) => {
				const o = s[id];
				s[id] = {
					...o,
					...data,
					[prop]: null,
				};
				return s;
			});
		} else {
			throw Error(`Fetch error: ${res.status} - ${await res.text()}`);
		}
	}

	return {
		store,
		fetchOne,
		fetchAll,
		create,
		update,
		patch: (path: string, body: Record<string, any>) => update({ path, body, method: 'PATCH' }),
		put: (path: string, body: Record<string, any>) => update({ path, body, method: 'PUT' }),
		delete: del,
		deleteProp,
	};
}

export async function doFetch(path: string, init: RequestInit = {}): Promise<Response> {
	if (!auth.currentUser) {
		await auth.authStateReady();
	}

	const headers = new Headers(init.headers);
	if (auth.currentUser) {
		headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
	}
	init.headers = headers;
	return fetch(path, init);
}

type UseStoreArgs<T extends Identifiable> = {
	key?: string;
	path: string;
	query?: Query;
	builder?: ItemBuilder<T>;
	updater?: ItemUpdater<T>;
	start?: StartStopNotifier<Record<string, T>> | undefined;
};

const stores: Record<string, FetchStore<any>> = {};
export function useStore<T extends Identifiable>({
	key,
	path,
	query,
	builder = defaultBuilder,
	updater = defaultUpdater,
	start,
}: UseStoreArgs<T>): FetchStore<T> {
	const k = key || path;
	let s = stores[k];
	if (!s) {
		s = createStore<T>(path, query, builder, updater, start);
		stores[k] = s;
	}
	return s;
}

export function derivedById<T extends Identifiable>(store: FetchStore<T>, id: string) {
	return derived(store.store, ($store) => {
		return $store[id];
	});
}

function defaultBuilder<T extends Identifiable>(data: Data): T[] {
	return [
		{
			...data,
			id: data.id,
		} as T,
	];
}

function defaultUpdater<T extends Identifiable>(
	store: Writable<Record<string, T>>,
	id: string,
	data: Record<string, any>,
) {
	store.update((s) => {
		s[id] = {
			...s[id],
			...data,
			id,
		};
		return s;
	});
}

export function defaultSchedulableUpdater<T extends Identifiable & Schedulable>(
	store: Writable<Record<string, T>>,
	id: string,
	data: Record<string, any>,
) {
	store.update((s) => {
		s[id] = {
			...s[id],
			...data,
			updatedAt: parseDate(data.updated_at),
			id,
		};
		return s;
	});
}

export const parseDate = (s: string) => (s ? new Date(s) : undefined);

export function sortByName(a: Nameable, b: Nameable) {
	const na = a.name.toLowerCase();
	const nb = b.name.toLowerCase();
	if (na < nb) {
		return -1;
	}
	if (na > nb) {
		return 1;
	}
	return 0;
}

export const sortByCreatedAt = (a: Schedulable, b: Schedulable) =>
	b.createdAt.getTime() - a.createdAt.getTime();

export const sortByUpdatedAt = (a: Schedulable, b: Schedulable) => {
	if (b.updatedAt) {
		if (a.updatedAt) {
			return b.updatedAt.getTime() - a.updatedAt.getTime();
		} else {
			return 1;
		}
	} else if (a.updatedAt) {
		return -1;
	} else {
		return b.createdAt.getTime() - a.createdAt.getTime();
	}
};

export const leadZero = (n: number) => ('0' + n).slice(-2);
export const strDate = (d?: Date) =>
	d ? `${d.getFullYear()}-${leadZero(d.getMonth() + 1)}-${leadZero(d.getDate())}` : '';
