import { Context } from 'hono/dist/types/context';
import { Bindings } from '../types';

import { getBodyParams } from '../utils/req';

import { Verification, checkVerificationCode, getValidedForAdmin, validateOwnership } from '../database';

export default async function validateCode(
	c: Context<{
		Bindings: Bindings;
	}>,
) {
	try {
		const { env, req } = c;
		const { DB } = env;

		const { params, missing } = await getBodyParams(req, ['rss_feed', 'admin_address', 'code']);
		if (missing.length) {
			throw new Error(`Please provide ${missing[0]} in the POST body `);
		}
		const { rss_feed, admin_address, code } = params;

		// user has 15 min to validate
		const limitMs = 150 * 60 * 1000;
		const { results: validEntries }: { results: Verification[] } = await checkVerificationCode(DB, rss_feed, admin_address, code, limitMs);

		if (!validEntries.length)
			throw new Error(
				`Invalid code (${code}) to validate ${admin_address} for this feed: ${rss_feed}. Maybe you provided an expired code.`,
			);
		await validateOwnership(DB, rss_feed, admin_address, code);

		const { results: validatedEntriesForUser }: { results: Verification[] } = await getValidedForAdmin(DB, admin_address);

		c.status(200);
		return c.json({ validatedFeedsForUser: validatedEntriesForUser.map((v: Verification) => v.RssFeed), success: true });
	} catch (e: any) {
		c.status(400);
		return c.json({ error: e.message });
	}
}
