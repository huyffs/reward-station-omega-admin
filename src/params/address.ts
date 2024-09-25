import type { ParamMatcher } from '@sveltejs/kit';
import { isAddress } from 'web3-validator';

export const match = ((param) => {
	return isAddress(param);
}) satisfies ParamMatcher;
