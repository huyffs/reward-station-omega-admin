import { useStore, type CreateResponse, type Schedulable, parseDate } from './async_store';
import type { BelongsToOrg } from './org_store';

export type Project = BelongsToOrg &
	Schedulable & {
		name: string;
		description?: string;
		website?: string;
		networks: Record<string, string>;
		logo?: string;
		images: string[];
		featureFrom?: Date;
		featureUntil?: Date;
	};

function projectBuilder(data: CreateResponse): Project[] {
	return [
		{
			id: data.id,
			org_id: data.org_id,
			name: data.name,
			logo: data.logo,
			images: data.images || [],
			website: data.website,
			networks: data.networks,
			description: data.description,
			featureFrom: parseDate(data.feature_from),
			featureUntil: parseDate(data.feature_until),
			createdAt: new Date(data.created_at),
			updatedAt: parseDate(data.updated_at),
		} as Project,
	];
}

export function useProjectStore(orgId: string) {
	return useStore<Project>({
		key: `projects/${orgId}`,
		path: `cm/project/${orgId}`,
		builder: projectBuilder,
	});
}
