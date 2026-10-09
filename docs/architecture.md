# Architecture notes

## Request path

1. The Contact page collects the inquiry. The visitor must complete required fields and consent before the form can be accepted.
2. The browser posts JSON to the same-origin Vercel route, `/api/lead`. The same-origin route means the browser never needs the Make webhook URL or API key.
3. The serverless function accepts POST only, checks the request size when `Content-Length` is provided, sanitizes and caps text fields, ignores the hidden honeypot, validates required fields and email format, and requires consent.
4. The function adds a server-generated `submittedAt` time and sends the JSON payload to the Make webhook with the `x-make-apikey` header.
5. Make runs its Airtable record creation and Gmail alert modules.
6. The website presents a WhatsApp handoff if the automated route returns an error or cannot be reached.

## Payload fields

| Field | Purpose |
| --- | --- |
| `name`, `email` | Contact details |
| `business` | Business or organization, if provided |
| `service`, `goal` | What the visitor wants help with |
| `consent` | Visitor's agreement to be contacted |
| `source`, `page`, `pageUrl`, `referrer` | Inquiry source context |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | Campaign attribution when present |
| `submittedAt` | Server-generated ISO timestamp |

The synthetic example in [`../examples/sample-lead.json`](../examples/sample-lead.json) contains no real person's information.

## Failure behavior

- Missing configuration returns a service-unavailable response from the endpoint.
- Invalid form data returns a client error.
- A Make rejection or network timeout returns a gateway error.
- The front-end then offers a prefilled WhatsApp message as a human-follow-up path.

The WhatsApp path is a fallback contact handoff, not an automated bot or guaranteed delivery queue. Failed submissions should be reviewed in Vercel and Make logs; do not replay live requests casually because a replay can create duplicate Airtable records and email alerts.

## Where configuration lives

- Vercel environment variables: `MAKE_WEBHOOK_URL`, `MAKE_WEBHOOK_API_KEY`
- Make: custom webhook, Airtable module, Gmail module
- Airtable: `Manan Marketing Leads` base → `Website Inquiries` table

Real values and exports stay in the authenticated services. This repository intentionally contains only a sanitized code snapshot and example payload.
