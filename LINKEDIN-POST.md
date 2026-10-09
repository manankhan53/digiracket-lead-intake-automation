One of the systems I’ve built for DigiRacket is a website lead-intake workflow.

When a visitor submits the project inquiry form, the request goes through a server-side endpoint, is checked for required details and consent, and is sent securely to Make. Make then creates a record in Airtable and sends an email notification so I can follow up. If the automated route is unavailable, the form offers a prefilled WhatsApp handoff.

The flow is:

Website form → Vercel function → Make → Airtable + email alert

I’ve documented the architecture and a sanitized reference implementation in a separate GitHub project. The live webhook credentials, account details, and personal lead data stay private.

This is workflow automation—not an AI chatbot or voice receptionist. I’m keeping those as separate projects with their own requirements and safeguards.

Building this made one thing clear: connecting apps is only part of the job. The workflow also needs validation, consent handling, a sensible fallback, and a clear record of where the data goes.

#BusinessAutomation #MarketingAutomation #LeadManagement #Make #Airtable
