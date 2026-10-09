# Project case study

## Summary

The DigiRacket website captures consented inquiries through a project form and routes them to a follow-up workflow. The aim is operational: keep form submissions organized in one Airtable table and notify the owner by email when an inquiry arrives.

## Problem

Website inquiries need a clear destination and a dependable follow-up path. If details arrive only in a browser session or are copied manually, they can be missed or become difficult to track.

## Solution

The form posts to a same-origin Vercel endpoint. The endpoint validates the request and forwards it to Make. Make writes the inquiry to Airtable and sends an email notification. A WhatsApp handoff remains available if the automated route cannot be reached.

## Design choices

- **Keep the Make credentials server-side:** the browser calls the DigiRacket endpoint; it never receives the webhook URL or API key.
- **Require consent:** the endpoint rejects submissions that do not include consent.
- **Use Airtable as the follow-up queue:** each accepted inquiry becomes a record with service, goal, attribution, and status fields.
- **Keep a human fallback:** when the automated route fails, the form offers WhatsApp rather than implying the inquiry was saved.
- **Respect client privacy:** this case study is about DigiRacket's own intake workflow; private client information is not used as evidence.

## Verification

The workflow was manually verified during setup: a submitted test inquiry produced an Airtable record and an email notification. No ongoing volume or business impact metrics have been measured for this system, so none are claimed.

## Current limitations

- A hidden-field honeypot provides a basic spam check; there is no dedicated rate limiter or CAPTCHA.
- There is no documented retention schedule for inquiry data yet.
- Make, Airtable, Gmail, and Vercel are separate hosted services, so their credentials and availability are managed outside this repository.
- The WhatsApp fallback opens a message for a person to send and reply to; it does not automate the conversation.
