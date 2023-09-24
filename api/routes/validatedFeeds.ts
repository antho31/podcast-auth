import { Context } from 'hono/dist/types/context';
import { Bindings } from '../types';

import { getBodyParams } from '../utils/req';

import { Verification, checkVerificationCode, getAllVerifications, getValidedForAdmin, validateOwnership } from '../database';

export default async function validatedFeeds(
	c: Context<{
		Bindings: Bindings;
	}>,
) {
	try {
		const { env, req } = c;
		const { DB } = env;

		const adminAddress = c.req.param('admin_address');

		const { results: validatedEntriesForUser }: { results: Verification[] } = await getValidedForAdmin(DB, adminAddress);

		c.status(200);
		return c.json({ validatedFeedsForUser: validatedEntriesForUser.map((v: Verification) => v.RssFeed), success: true });
	} catch (e: any) {
		c.status(400);
		return c.json({ error: e.message });
	}
}
