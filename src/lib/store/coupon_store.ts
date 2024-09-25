import {
	useStore,
	type CreateResponse,
	type Schedulable,
	type Identifiable,
	parseDate,
} from './async_store';

export type Coupon = Identifiable &
	Schedulable & {
		reward_id: string;
		number: number;
		url: string;
		user_id?: string;
		mintedAt?: Date;
	};

function couponBuilder(data: CreateResponse): Coupon[] {
	const _builder = (d: CreateResponse) =>
		({
			id: `${data.reward_id}/${d.number}`,
			reward_id: data.reward_id,
			number: d.number,
			url: d.url,
			user_id: d.user_id,
			mintedAt: parseDate(d.minted_at),
			createdAt: new Date(d.created_at),
			updatedAt: parseDate(d.updated_at),
		}) as Coupon;
	if (data.coupons) {
		return data.coupons.map(_builder);
	} else {
		return [_builder(data)];
	}
}

export function useCouponStore(rewardId: string) {
	return useStore<Coupon>({
		key: `coupons/${rewardId}`,
		path: `su/coupon`,
		query: { reward_id: rewardId },
		builder: couponBuilder,
	});
}
