import { Hono } from 'hono';

import { Bindings } from './types';
import { generateCode, validateCode, validatedFeeds } from './routes';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * @openapi
 * /:admin_address/validated-feeds
 * 	get:
 *  	summary: Get podcasts feeds the user has validated the ownership
 *    description: Verify all podcast feeds the user has provided (validated)
 * 		produces:
 * 		- application/json
 * 		parameters:
 * 		- name: admin_address
 * 			in: path
 * 			description: User ID
 * 		 	required: true
 * 			type: string
 *    responses:
 *    	'200':
 *         description: Successful operation. Returns JSON with verification details.
 *      '400':
 *         description: Bad Request. Indicates missing or invalid parameters.
 */
app.get('/:admin_address/validated-feeds', validatedFeeds);

/**
 * @openapi
 * /generate-code:
 * 	post:
 *  	summary: Code generation to authenticate
 *    description: Generate a code to check a podcast feed ownership and send it by mail
 *    consumes:
 * 		- multipart/form-data
 * 		- application/json
 * 		produces:
 * 		- application/json
 * 		parameters:
 * 		- name: rss_feed
 * 			in: formData
 * 			description: Podcast RSS feed to verify ownership
 * 		 	required: true
 * 			type: string
 * 		- name: admin_address
 * 			in: formData
 * 			description: User ID to link ownership
 * 		 	required: true
 * 			type: string
 *    responses:
 *    	'201':
 *         description: Successful operation. Returns JSON with verification details.
 *      '400':
 *         description: Bad Request. Indicates missing or invalid parameters.
 */
app.post('/generate-code', generateCode);

/**
 * @openapi
 * /validate-code
 * 	post:
 *  	summary: Validate authentication
 *    description: Check if provided code is the one previously generated with /generate-code route and sent by mail
 *    consumes:
 * 		- multipart/form-data
 * 		- application/json
 * 		produces:
 * 		- application/json
 * 		parameters:
 * 		- name: rss_feed
 * 			in: formData
 * 			description: Podcast RSS feed to verify ownership
 * 		 	required: true
 * 			type: string
 * 		- name: admin_address
 * 			in: formData
 * 			description: User ID to link ownership
 * 		 	required: true
 * 			type: string
 * 		- name: code
 * 			in: formData
 * 			description: Code received by mail
 * 		 	required: true
 * 			type: string
 *    responses:
 *    	'200':
 *         description: Successful operation
 *      '400':
 *         description: Bad Request. Indicates missing or invalid parameters.
 */
app.post('/validate-code', validateCode);

// 404 for everything else
app.all('*', (c) => c.json({ error: 'Not found' }));

export default app;
