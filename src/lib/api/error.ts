export function errResponse(status: number, message: string): Response {
	return new Response(
		JSON.stringify({
			error: message,
		}),
		{
			status,
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
}