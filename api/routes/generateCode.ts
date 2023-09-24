import { Context } from 'hono/dist/types/context';
import { Bindings } from '../types';

import { getBodyParams } from '../utils/req';
import { OwnerRSSInfo, extractOwnerFromRSS } from '../utils/rss';

import { storeVerificationCode } from '../database';
import { SendMailParams, sendEmail } from '../mail';

export default async function generateCode(
	c: Context<{
		Bindings: Bindings;
	}>,
) {
	try {
		const { env, req } = c;
		const { DB, MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE, MJ_SENDER_MAIL } = env;

		const { params, missing } = await getBodyParams(req, ['rss_feed', 'admin_address']);
		if (missing.length) {
			throw new Error(`Please provide ${missing[0]} in the POST body `);
		}
		const { rss_feed, admin_address } = params;

		const owner: OwnerRSSInfo | null = await extractOwnerFromRSS(rss_feed);
		if (!owner?.mail) throw new Error('Missing itunes:email tag in RSS');

		// random 6-digit code between 100000 and 999999 (inclusive)
		const randomCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

		await storeVerificationCode(DB, rss_feed, admin_address, randomCode);

		const sendMailParams: SendMailParams = {
			apiKey: MJ_APIKEY_PUBLIC,
			apiSecret: MJ_APIKEY_PRIVATE,
			fromEmail: MJ_SENDER_MAIL,
			fromName: 'Podcast Authentication Backend',
			toEmail: owner.mail,
			toName: owner.name,
			subject: `${randomCode}: Your code to verify your podcast ownership`,
			content: `Provide this code: ${randomCode} to verify the podcast ownership for the feed ${rss_feed} and the admin address ${admin_address}`,
		};
		await sendEmail(sendMailParams);

		c.status(201);
		return c.json({ owner, success: true });
	} catch (e: any) {
		c.status(400);
		return c.json({ error: e.message });
	}
}
