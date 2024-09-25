import { dev } from '$app/environment';

export async function uploadFile(bucket: R2Bucket, path: string, file: File, name: string) {
	let ext: string = '';
	switch (file.type) {
		case 'image/jpeg':
			ext = 'jpeg';
			break;
		case 'image/png':
			ext = 'png';
			break;
		case 'image/webp':
			ext = 'webp';
			break;
		default:
			const i = file.name.lastIndexOf('.');
			if (i > 0) {
				ext = file.name.substring(i);
			}
	}

	const key = `${path}/${name}.${ext}`;
	console.log('uploading image:', key);
	const res = await bucket.put(key, file, {
		httpMetadata: {
			contentType: file.type,
		},
		customMetadata: {
			name: file.name,
		},
	});
	console.log('res:', res);
	if (!dev && !res) {
		console.log('up res:', res);
		return;
	}
	return key;
}
