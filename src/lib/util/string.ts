export function compact(s: string) {
	if (s.length < 10) {
		return s;
	}
	return s.substring(0, 3) + '...' + s.slice(-4);
}
