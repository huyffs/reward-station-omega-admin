// GET COOKIE
export function getCookie(name: string): string {
	let cookieName = name + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(cookieName) == 0) {
			return c.substring(cookieName.length, c.length);
		}
	}
	return '';
}

// SET COOKIE
export function setCookie(
	name: string,
	value: string,
	expires?: number | Date | string,
	secure?: boolean,
) {
	if (expires) {
		if (typeof expires === 'number') {
			const d = new Date();
			d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);
			expires = d.toUTCString();
		} else if (expires instanceof Date) {
			expires = expires.toUTCString();
		}
		expires = ';expires=' + expires;
	}

	let cookie = name + '=' + value + expires + ';path=/';
	if (secure) {
		cookie += ' secure';
	}
	document.cookie = cookie;
}

// DELETE COOKIE
export function deleteCookie(name: string) {
	document.cookie = name + '=; Max-Age=-99999999;';
}
