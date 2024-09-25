import type { Writable } from 'svelte/store';
import { useStore, type Identifiable, type Schedulable, parseDate, type Nameable } from './async_store';

export type Reward = Identifiable & Nameable &
	Schedulable & {
		issuer_id?: string;
		category?: number;
		country_id?: number;
		description: string;
		tandc?: string;
		images: string[];
		activeFrom?: Date;
		activeUntil?: Date;
		validFrom?: Date;
		validUntil?: Date;
	};

export function rewardBuilder<T extends Identifiable & Record<string, any>>(data: T): Reward[] {
	return [
		{
			id: data.id,
			issuer_id: data.issuer_id,
			category: data.category,
			country_id: data.country_id,
			name: data.name,
			description: data.description,
			tandc: data.tandc,
			images: data.images || [],
			activeFrom: parseDate(data.active_from),
			activeUntil: parseDate(data.active_until),
			validFrom: parseDate(data.valid_from),
			validUntil: parseDate(data.valid_until),
			createdAt: new Date(data.created_at),
			updatedAt: parseDate(data.updated_at),
		} as Reward,
	];
}

export function rewardUpdater(
	store: Writable<Record<string, Reward>>,
	id: string,
	data: Record<string, any>,
) {
	store.update((s) => {
		const item = s[id];
		s[id] = {
			...item,
			issuer_id: data.issuer_id ?? item.issuer_id,
			category: data.category ?? item.category,
			country_id: data.country_id ?? item.country_id,
			name: data.name ?? item.name,
			description: data.description ?? item.description,
			tandc: data.tandc ?? item.tandc,
			images: data.images ?? item.images,
			validFrom: data.valid_from ? parseDate(data.valid_from) : item.validFrom,
			validUntil: data.valid_until ? parseDate(data.valid_until) : item.validUntil,
			activeFrom: data.active_from ? parseDate(data.active_from) : item.activeFrom,
			activeUntil: data.active_until ? parseDate(data.active_until) : item.activeUntil,
			updatedAt: parseDate(data.updated_at),
		};
		return s;
	});
}

export const rewardStore = useStore<Reward>({
	key: `rewards`,
	path: `cm/reward`,
	builder: rewardBuilder,
	updater: rewardUpdater,
});
