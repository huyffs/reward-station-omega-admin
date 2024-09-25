import type { Writable } from 'svelte/store';
import { useStore, type CreateResponse, type Schedulable, parseDate } from './async_store';
import type { BelongsToOrg } from './org_store';

export type Engagement = BelongsToOrg &
	Schedulable & {
		project_id: string;
		campaign_id: string;
		country_id?: number;
		user_id: string;
		user_name?: string;
		chain_id: number;
		signer_address: string;
		messages: Record<string, string>;
		accepted: Record<string, boolean>;
		submissions: Record<string, Submission>;
		coupon_issue_id?: string;
		coupon_serial?: string;
		coupon_url?: string;
		submitted: number;
		approved: number;
	};

export type Submission = {
	message?: string;
	link?: string;
	images?: string[];
};

function engagementBuilder(data: CreateResponse): Engagement[] {
	return [
		{
			id: data.id,
			org_id: data.org_id,
			project_id: data.project_id,
			campaign_id: data.campaign_id,
			country_id: data.country_id,
			user_id: data.user_id,
			user_name: data.user_name,
			chain_id: data.chain_id,
			signer_address: data.signer_address,
			messages: data.messages,
			accepted: data.accepted,
			submissions: data.submissions,
			coupon_issue_id: data.coupon_issue_id,
			coupon_serial: data.coupon_serial,
			coupon_url: data.coupon_url,
			createdAt: new Date(data.created_at),
			updatedAt: parseDate(data.updated_at),
			submitted: Object.keys(data.submissions).length,
			approved: Object.values(data.accepted).filter((accepted) => accepted).length,
		} as Engagement,
	];
}

function engagementUpdater(
	store: Writable<Record<string, Engagement>>,
	id: string,
	data: Record<string, any>,
) {
	store.update((s) => {
		const item = s[id] || {};
		const accepted = data.accepted ?? item.accepted;
		const submissions = data.submissions ?? item.submissions;
		s[id] = {
			...item,
			country_id: data.country_id ?? item.country_id,
			signer_address: data.signer_address ?? item.signer_address,
			messages: data.messages ?? item.messages,
			accepted,
			submissions,
			coupon_issue_id: data.coupon_issue_id ?? item.coupon_issue_id,
			coupon_serial: data.coupon_serial ?? item.coupon_serial,
			coupon_url: data.coupon_url ?? item.coupon_url,
			updatedAt: parseDate(data.updated_at),
			submitted: Object.keys(submissions).length,
			approved: Object.values(accepted).filter((isAccepted) => isAccepted).length,
		};
		return s;
	});
}

export function useEngagementStore(orgId: string, campaignId: string) {
	return useStore<Engagement>({
		key: `engagements/${orgId}/${campaignId}`,
		path: `cm/engage/${orgId}`,
		query: { campaign_id: campaignId },
		builder: engagementBuilder,
		updater: engagementUpdater,
	});
}
