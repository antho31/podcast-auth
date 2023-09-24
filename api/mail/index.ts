export type SendMailParams = {
	apiKey: string;
	apiSecret: string;
	fromEmail: string;
	fromName: string;
	toEmail: string;
	toName: string;
	subject: string;
	content: string;
};

export async function sendEmail({
	apiKey,
	apiSecret,
	fromEmail,
	fromName,
	toEmail,
	toName,
	subject,
	content,
}: SendMailParams): Promise<unknown> {
	const encoded: string = Buffer.from(`${apiKey}:${apiSecret}`, 'utf8').toString('base64');

	const apiEndpoint = 'https://api.mailjet.com/v3.1/send';

	const emailData = {
		Messages: [
			{
				From: {
					Email: fromEmail,
					Name: fromName,
				},
				To: [
					{
						Email: toEmail,
						Name: toName,
					},
				],
				Subject: subject,
				TextPart: content,
				HTMLPart: content,
			},
		],
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${encoded}`,
		},

		body: JSON.stringify(emailData),
	};

	return fetch(apiEndpoint, requestOptions);
}
