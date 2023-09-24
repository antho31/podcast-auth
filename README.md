# Podcast Authentication Backend

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

 This TypeScript-based backend system provides a secure and efficient way to authenticate podcasters through email verification. It uses Cloudflare Workers for API routing, Cloudflare D1 SQL database for data storage, and Mailjet for email notifications.

- [Podcast Authentication Backend](#podcast-authentication-backend)
	- [Features](#features)
	- [Usage example](#usage-example)
	- [Development](#development)
		- [Prerequisites](#prerequisites)
		- [Setup](#setup)
			- [Installation](#installation)
			- [Mailjet configuration](#mailjet-configuration)
			- [Cloudflare configuration](#cloudflare-configuration)
		- [Start the dev server](#start-the-dev-server)
		- [Deployment](#deployment)
	- [License](#license)

## Features

- **Generate Verification Code**: Generate a code to check a podcast RSS feed ownership and send it by mail (email address provided in the `itunes:email` tag). Ownership is linked to any user ID, originally built to be tied to a user's EVM address.

- **Verify Podcasters**: Allow podcasters to verify their identity by submitting the verification code received via email. The system checks the code's validity and expiration.

## Usage example

1. Generate a verification code:

```shell
curl --request POST \
  --url 'https://podcast-auth.anthonygourraud.workers.dev/generate-code' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data rss_feed=https://www.vocast.fr/desondes/rss/main \
  --data admin_address=0x64E8f7C2B4fd33f5E8470F3C6Df04974F90fc2cA
```

2. Verify the ownership, with the code received by mail:

```shell
curl --request POST \
  --url 'https://podcast-auth.anthonygourraud.workers.dev/validate-code' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data rss_feed=https://www.vocast.fr/desondes/rss/main \
  --data admin_address=0x64E8f7C2B4fd33f5E8470F3C6Df04974F90fc2cA \
  --data code=222311
```

3. Get all validated feeds for a user (from the EVM address account):

```shell
curl --request GET \
  --url 'https://podcast-auth.anthonygourraud.workers.dev/0x64E8f7C2B4fd33f5E8470F3C6Df04974F90fc2cA/validated-feeds'
```

## Development

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed
- Cloudflare account
- A Mailjet API key

### Setup

#### Installation

To install the project, follow these steps:

```shell
git clone https://github.com/antho31/podcast-auth.git
cd podcast-auth
npm install
```

#### Mailjet configuration

Create a `.dev.vars` file and provide the following environment variables:

| Variable Name         | Description                                   | Required  |
|-----------------------|-----------------------------------------------|-----------|
| MJ_APIKEY_PUBLIC      | Public API key for Mailjet                    | Yes       |
| MJ_APIKEY_PRIVATE     | Private API key for Mailjet                   | Yes       |
| MJ_SENDER_MAIL        | Sender's email address for Mailjet            | Yes       |

 See `.dev.example.vars` for an example.

#### Cloudflare configuration

1. Use `wrangler` to log in:

```shell
npx wrangler login
```

2. Create a D1 database:

```shell
npx wrangler d1 create PodcastAuth
```

Note the created database `database_id`.

3. Update `database_id` in the `wrangler.toml` configuration file.

4. Add the required SQL table:

```shell
npm run int-db
```

5. Add secrets in production:

```shell
npx wrangler secret put MJ_APIKEY_PRIVATE
npx wrangler secret put MJ_APIKEY_PUBLIC
npx wrangler secret put MJ_SENDER_MAIL
```

### Start the dev server

```shell
npm run dev-api
```

Access the API at \`<http://localhost:8787\`>.

### Deployment

To deploy the project to Cloudflare Workers:

```shell
npm run deploy-api
```

Note the published API endpoint.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
