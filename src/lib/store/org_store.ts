import type { Writable } from 'svelte/store';
import {
	useStore,
	type Identifiable,
	type Schedulable,
	parseDate,
	defaultSchedulableUpdater,
} from './async_store';

export type Org = Identifiable &
	Schedulable & {
		name: string;
		logo?: string;
		admins: Record<string, number>;
	};

function orgBuilder<T extends Identifiable & Record<string, any>>(data: T): Org[] {
	return [
		{
			id: data.id,
			name: data.name,
			logo: data.logo,
			admins: data.admins,
			createdAt: new Date(data.created_at),
			updatedAt: parseDate(data.updated_at),
		} as Org,
	];
}

export const orgStore = useStore<Org>({
	key: 'orgs',
	path: `cm/org`,
	builder: orgBuilder,
	updater: defaultSchedulableUpdater,
});

export type BelongsToOrg = Identifiable & {
	org_id: string;
};
