import { useStore, type CreateResponse, type Schedulable, parseDate } from './async_store';
import type { BelongsToOrg } from './org_store';

export type Campaign = BelongsToOrg &
	Schedulable & {
		name: string;
		description?: string;
		logo?: string;
		images: string[];
		coupon_code: string;
		budget: Big;
		chain_id: number;
		contract_address: string;
		condition_info: string;
		reward_amount?: Big;
		reward_info?: string;
		tasks: Task[];
		startAt: Date;
		endAt?: Date;
		voucherPolicy: number;
		voucherExpireAt?: Date;
	};

export type Task = {
	id: string;
	name: string;
	description: string;
	link: string;
	images: string[];
	point?: number;
};

function campaignBuilder(data: CreateResponse): Campaign[] {
	return [
		{
			id: data.id,
			org_id: data.org_id,
			project_id: data.project_id,
			name: data.name,
			description: data.description,
			logo: data.logo,
			images: data.images || [],
			coupon_code: data.coupon_code,
			budget: data.budget,
			chain_id: data.chain_id,
			contract_address: data.contract_address,
			condition_info: data.condition_info,
			reward_amount: data.reward_amount,
			reward_info: data.reward_info,
			tasks: data.tasks,
			startAt: new Date(data.start_at),
			endAt: parseDate(data.end_at),
			createdAt: new Date(data.created_at),
			updatedAt: parseDate(data.updated_at),
			voucherPolicy: data.voucher_policy,
			voucherExpireAt: parseDate(data.voucher_expire_at),
		} as Campaign,
	];
}

export function useCampaignStore(orgId: string, projectId: string) {
	return useStore<Campaign>({
		key: `campaigns/${orgId}/${projectId}`,
		path: `cm/campaign/${orgId}`,
		query: { project_id: projectId },
		builder: campaignBuilder,
	});
}
