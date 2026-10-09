const text = (value, max) => typeof value === 'string'
  ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
  : '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  const webhookKey = process.env.MAKE_WEBHOOK_API_KEY;
  if (!webhookUrl) return res.status(503).json({ error: 'Lead routing is not configured.' });
  if (Number(req.headers['content-length'] || 0) > 12000) {
    return res.status(413).json({ error: 'Inquiry is too large.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid inquiry data.' }); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid inquiry data.' });
  }

  // Quietly discard bot submissions that populated the off-screen honeypot.
  if (text(body.website, 200)) return res.status(200).json({ ok: true });

  const lead = {
    name: text(body.name, 120),
    email: text(body.email, 254).toLowerCase(),
    business: text(body.business, 200),
    service: text(body.service, 100),
    goal: text(body.goal, 3000),
    consent: body.consent === 'on' || body.consent === true,
    source: 'website',
    page: text(body.page, 100) || 'contact',
    pageUrl: text(body.pageUrl, 1000),
    referrer: text(body.referrer, 1000),
    utm_source: text(body.utm_source, 160),
    utm_medium: text(body.utm_medium, 160),
    utm_campaign: text(body.utm_campaign, 200),
    utm_content: text(body.utm_content, 200),
    utm_term: text(body.utm_term, 200),
    submittedAt: new Date().toISOString()
  };
  if (!lead.name || !lead.email || !lead.service || !lead.goal || !lead.consent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return res.status(400).json({ error: 'Please complete the required fields.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const result = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookKey ? { 'x-make-apikey': webhookKey } : {})
      },
      body: JSON.stringify(lead),
      signal: controller.signal
    });
    if (!result.ok) return res.status(502).json({ error: 'Lead workflow did not accept the inquiry.' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Lead workflow is temporarily unavailable.' });
  } finally {
    clearTimeout(timeout);
  }
}
