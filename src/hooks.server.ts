import { connectR2 } from 'wrangler-proxy';

export const handle = ({ event, resolve }) => {
	event.locals.PROOF_BUCKET = event.platform?.env?.PROOF_BUCKET ?? connectR2('PROOF_BUCKET');
	// or connectD1('D1', { hostname: 'custom-host-name' });
	// default hostname is `http://127.0.0.1:8787`
	return resolve(event);
};
