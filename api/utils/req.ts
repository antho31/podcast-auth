import { HonoRequest } from 'hono';

export async function getBodyParams(req: HonoRequest, paramList: string[]) {
	const headers = req.header();

	const params: Record<string, string> =
		headers['content-type'] === 'application/json'
			? await req.json()
			: headers['content-type'] === 'multipart/form-data'
			? await req.parseBody()
			: headers['content-type'] === 'application/x-www-form-urlencoded'
			? await req.parseBody()
			: {};

	const missing: string[] = [];
	for (const p of paramList) {
		if (!params[p]) missing.push(p);
	}

	return { params, missing };
}
