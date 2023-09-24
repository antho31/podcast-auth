import xml2js from 'xml2js';

export type OwnerRSSInfo = {
	mail: string;
	name: string;
};

export async function extractOwnerFromRSS(rss_feed: string): Promise<OwnerRSSInfo | null> {
	try {
		const response = await fetch(rss_feed);
		const xmlData = await response.text();
		const result = await xml2js.parseStringPromise(xmlData);

		if (result.rss && result.rss.channel && result.rss.channel[0]) {
			const channel = result.rss.channel[0];
			if (channel['itunes:owner'] && channel['itunes:owner'][0] && channel['itunes:owner'][0]['itunes:email']) {
				return { mail: channel['itunes:owner'][0]['itunes:email'][0], name: channel['itunes:owner'][0]['itunes:name'][0] };
			}
		}

		return null;
	} catch (error) {
		console.error('Error extracting email from RSS:', error);
		return null;
	}
}
