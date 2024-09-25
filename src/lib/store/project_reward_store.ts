import type { Writable } from 'svelte/store';
import { useStore, type Identifiable, parseDate } from './async_store';
import type { BelongsToOrg } from './org_store';
import { rewardBuilder, type Reward } from './reward_store';

export type ProjectReward = BelongsToOrg &
	Reward & {
		project_id: string;
		point: number;
		approved: boolean;
		active: boolean;
		max_mint?: number;
		user_mint?: number;
		linkCreatedAt: Date;
		linkUpdatedAt?: Date;
		coupon_minted: number;
		coupon_total: number;
	};

function projectRewardBuilder<T extends Identifiable & Record<string, any>>(
	data: T,
): ProjectReward[] {
	return [
		{
			...rewardBuilder(data)[0],
			org_id: data.org_id,
			project_id: data.project_id,
			point: data.point,
			approved: data.approved,
			active: data.active,
			max_mint: data.max_mint,
			user_mint: data.user_mint,
			linkCreatedAt: new Date(data.link_created_at),
			linkUpdatedAt: parseDate(data.link_updated_at),
			coupon_minted: data.coupon_minted,
			coupon_total: data.coupon_total,
		} as ProjectReward,
	];
}

function projectRewardUpdater(
	store: Writable<Record<string, ProjectReward>>,
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
			project_id: data.project_id ?? item.project_id,
			point: data.point ?? item.point,
			approved: data.approved ?? item.approved,
			active: data.active ?? item.active,
			max_mint: data.max_mint ?? item.max_mint,
			user_mint: data.user_mint ?? item.user_mint,
			updatedAt: data.updated_at ? parseDate(data.updated_at) : item.updatedAt,
			linkUpdatedAt: data.link_updated_at ? parseDate(data.link_updated_at) : item.linkUpdatedAt,
			coupon_minted: data.coupon_minted ?? item.coupon_minted,
			coupon_total: data.coupon_total ?? item.coupon_total,
		};
		return s;
	});
}

export function useProjectRewardStore(orgId: string, projectId: string) {
	return useStore<ProjectReward>({
		key: `project-rewards/${orgId}/${projectId}`,
		path: `cm/project-reward/${orgId}/${projectId}`,
		builder: projectRewardBuilder,
		updater: projectRewardUpdater,
	});
}
