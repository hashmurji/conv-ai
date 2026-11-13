// Conv-AI email templates. Brand: Forest #003F2A, Leaf #5B9E42, Sage mist #F1F7F0, Ink #112D27.
// Inter with Arial fallback; PNG logo (hosted), as the brand guidelines ask for email.
const FOREST = '#003F2A', LEAF = '#5B9E42', MIST = '#F1F7F0', INK = '#112D27', MUTED = '#52665F';
const FONT = "Inter, Arial, Helvetica, sans-serif";

const COMPANY = { trading: 'Conv-AI', legal: 'Lucere TG Ltd', number: '12995725', office: 'Carlyle House, 78 Chorley New Road, Bolton, Greater Manchester, BL1 4BY' };
// Call once with the registered office (the Worker passes env.COMPANY_OFFICE).
export function setOffice(office) { if (office) COMPANY.office = office; }

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const legalLine = () => `${COMPANY.trading} is a trading name of ${COMPANY.legal}, registered in England and Wales, company number ${COMPANY.number}. Registered office: ${esc(COMPANY.office)}.`;

function shell({ siteUrl, logoUrl, preheader, heading, body, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:${MIST};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MIST};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr><td style="background:#ffffff;border:1px solid #DCE8DC;border-radius:20px;overflow:hidden;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="height:6px;background:${FOREST};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 0 36px;"><a href="${esc(siteUrl)}" style="text-decoration:none;"><img src="${esc(logoUrl)}" width="168" alt="Conv-AI" style="display:block;border:0;width:168px;height:auto;"></a></td></tr>
        <tr><td style="padding:24px 36px 8px 36px;font-family:${FONT};font-size:26px;line-height:1.2;font-weight:700;color:${FOREST};">${esc(heading)}</td></tr>
        <tr><td style="padding:8px 36px 36px 36px;font-family:${FONT};font-size:16px;line-height:1.6;color:${INK};">${body}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:22px 20px 0 20px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
      ${footerNote ? esc(footerNote) + '<br>' : ''}${legalLine()}<br>
      <a href="${esc(siteUrl)}/#privacy" style="color:${FOREST};">Privacy policy</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px 0;"><tr><td style="background:${FOREST};border-radius:12px;"><a href="${esc(href)}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${esc(label)}</a></td></tr></table>`;

const row = (label, value) => `<tr><td style="padding:10px 14px;border-bottom:1px solid #E3ECE3;font-family:${FONT};font-size:13px;font-weight:700;color:${MUTED};width:38%;vertical-align:top;">${esc(label)}</td><td style="padding:10px 14px;border-bottom:1px solid #E3ECE3;font-family:${FONT};font-size:15px;color:${INK};vertical-align:top;">${esc(value || '-').replace(/\n/g, '<br>')}</td></tr>`;

const details = (d) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0 0;background:${MIST};border-radius:14px;">
${row('Name', d.name)}${row('Email', d.email)}${row('Firm or organisation', d.organisation)}${row('I am a', d.type)}${row('Title reviews a month', d.volume)}${row('Focus group', d['focus-group'] ? 'Yes, wants to join' : 'Not requested')}${row('Demo', d.demo ? 'Yes, wants a demo' : 'Not requested')}${row('Message', d.message)}
</table>`;

// Sent to the person who filled in the form
function confirmation(d, cfg) {
  const first = String(d.name || '').trim().split(/\s+/)[0] || 'there';
  const focus = d['focus-group']
    ? `<p style="margin:0 0 14px 0;">You asked to join the <strong>Conv-AI focus group</strong>. Focus group members get early access during the pilot and a direct line to the conveyancers building the platform.</p>`
    : '';
  const demo = d.demo ? `<p style="margin:0 0 14px 0;">You asked for a <strong>demo</strong>. We will email you to arrange a time that suits.</p>` : '';
  return {
    subject: 'Thanks for getting in touch with Conv-AI',
    html: shell({
      ...cfg,
      preheader: 'We have your details and someone will be in touch.',
      heading: 'Thanks for getting in touch',
      body: `<p style="margin:0 0 14px 0;">Hi ${esc(first)},</p>
<p style="margin:0 0 14px 0;">Thank you for your interest in Conv-AI. We have your details and someone will be in touch shortly.</p>
${focus}
${demo}
<p style="margin:0;">In the meantime, you can see how a title moves through Conv-AI, from draft contract pack to a plain English client report.</p>
${button(cfg.siteUrl + '/#how-it-works', 'See how it works')}
<p style="margin:22px 0 0 0;">Kind regards,<br><strong style="color:${FOREST};">The Conv-AI team</strong></p>`,
      footerNote: 'You received this email because you contacted Conv-AI through our website.',
    }),
  };
}

// Sent to the Conv-AI team inbox
function notification(d, cfg) {
  return {
    subject: `New website enquiry: ${d.name || 'Unknown'}${d.type ? ' (' + d.type + ')' : ''}`,
    html: shell({
      ...cfg,
      preheader: `${d.name || 'Someone'} got in touch through the website.`,
      heading: d.demo ? 'New demo request' : d['focus-group'] ? 'New focus group request' : 'New website enquiry',
      body: `<p style="margin:0;">Reply to this email to respond directly to ${esc(d.name || 'the sender')}.</p>${details(d)}`,
      footerNote: 'Internal notification from the Conv-AI website contact form.',
    }),
  };
}

// Email signature: paste the returned HTML into Outlook / Gmail signature settings
function signature(p, cfg) {
  const line = (v, href) => v ? `<tr><td style="font-family:${FONT};font-size:13px;line-height:1.5;color:${INK};">${href ? `<a href="${esc(href)}" style="color:${INK};text-decoration:none;">${esc(v)}</a>` : esc(v)}</td></tr>` : '';
  const web = String(cfg.siteUrl || '').replace(/^https?:\/\//, '');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:${FONT};">
<tr>
  <td style="padding:0 18px 0 0;vertical-align:middle;"><a href="${esc(cfg.siteUrl)}" style="text-decoration:none;"><img src="${esc(cfg.logoUrl)}" width="132" alt="Conv-AI" style="display:block;border:0;width:132px;height:auto;"></a></td>
  <td style="padding:0 0 0 18px;border-left:2px solid ${LEAF};vertical-align:middle;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:${FONT};font-size:16px;line-height:1.3;font-weight:700;color:${FOREST};">${esc(p.name)}</td></tr>
      ${p.role ? `<tr><td style="font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};padding-bottom:6px;">${esc(p.role)}</td></tr>` : ''}
      ${line(p.phone, p.phone ? 'tel:' + String(p.phone).replace(/[^+\d]/g, '') : '')}
      ${line(p.email, p.email ? 'mailto:' + p.email : '')}
      ${line(web, cfg.siteUrl)}
    </table>
  </td>
</tr>
<tr><td colspan="2" style="padding:14px 0 0 0;font-family:${FONT};font-size:12px;line-height:1.5;font-weight:700;color:${FOREST};">Clear property title intelligence, designed for conveyancers, by conveyancers.</td></tr>
<tr><td colspan="2" style="padding:6px 0 0 0;font-family:${FONT};font-size:10px;line-height:1.5;color:${MUTED};max-width:460px;">${legalLine()}</td></tr>
</table>`;
}

export { confirmation, notification, signature, shell, COMPANY };
