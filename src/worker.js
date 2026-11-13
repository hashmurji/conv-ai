// Conv-AI website Worker. Static files in ./public are served by Cloudflare directly;
// this script only handles POST /api/contact, which emails the enquiry through Resend.
//
// Secret (Workers & Pages > conv-ai > Settings > Variables and Secrets, or `npx wrangler secret put RESEND_API_KEY`):
//   RESEND_API_KEY   API key from resend.com
// Optional variables (see wrangler.jsonc): EMAIL_FROM, EMAIL_NOTIFY, SITE_URL, COMPANY_OFFICE
import { confirmation, notification, setOffice } from './email.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function send(env, message) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function contact(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  if (Number(request.headers.get('content-length') || 0) > 20000) return json(413, { error: 'Too large' });

  let data;
  try { data = Object.fromEntries(await request.formData()); } catch (e) { return json(400, { error: 'Bad request' }); }
  if (data['bot-field']) return json(200, { ok: true }); // spam trap: pretend it worked

  const clean = (v, max) => String(v || '').trim().slice(0, max);
  const d = {
    name: clean(data.name, 120), email: clean(data.email, 200), organisation: clean(data.organisation, 160),
    type: clean(data.type, 60), volume: clean(data.volume, 60), message: clean(data.message, 4000),
    'focus-group': data['focus-group'] ? 'on' : '',
    demo: data.demo ? 'on' : '',
  };
  if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email)) return json(400, { error: 'Name and a valid email are required' });
  if (!env.RESEND_API_KEY) { console.error('RESEND_API_KEY is not set'); return json(503, { error: 'Email is not configured' }); }

  setOffice(env.COMPANY_OFFICE);
  const from = env.EMAIL_FROM || 'Conv-AI <hello@conv-ai.co.uk>';
  const notify = env.EMAIL_NOTIFY || 'hello@conv-ai.co.uk';
  const siteUrl = (env.SITE_URL || 'https://conv-ai.co.uk').replace(/\/$/, '');
  const cfg = { siteUrl, logoUrl: `${siteUrl}/assets/logo-email.png` };

  // The enquiry must reach the team, or the visitor is told it did not send.
  const team = notification(d, cfg);
  try { await send(env, { from, to: [notify], subject: team.subject, html: team.html, reply_to: d.email }); }
  catch (e) { console.error(e.message); return json(502, { error: 'Could not send' }); }

  // The thank-you email is best effort.
  const thanks = confirmation(d, cfg);
  try { await send(env, { from, to: [d.email], subject: thanks.subject, html: thanks.html, reply_to: notify }); }
  catch (e) { console.error(e.message); }

  return json(200, { ok: true });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return contact(request, env);
    if (pathname.startsWith('/api/')) return json(404, { error: 'Not found' });
    return env.ASSETS.fetch(request);
  },
};
