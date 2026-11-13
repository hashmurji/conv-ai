# conv-ai.co.uk: IONOS to Cloudflare

Target set-up: Cloudflare runs the DNS and hosts the website. Netlify hosts the platform at app.conv-ai.co.uk.
IONOS keeps the domain registration only. Email is Cloudflare Email Routing plus Gmail, sending through Resend.

Hosting the root domain on Cloudflare needs the domain's nameservers to be Cloudflare's, so the DNS has to move.
Once it does, the records in the IONOS panel stop applying. Nothing needs changing in IONOS before then.

## 1. Add the domain to Cloudflare

1. Cloudflare dashboard > Add a domain > `conv-ai.co.uk` > Free plan.
2. Cloudflare scans the existing records. Check the email records below came across, and add any that are missing.

## 2. Email records to keep (copy exactly from IONOS, all DNS only)

| Type  | Name                   | Value                                   | Notes       |
|-------|------------------------|-----------------------------------------|-------------|
| MX    | @                      | mx00.ionos.co.uk                        | priority 10 |
| MX    | @                      | mx01.ionos.co.uk                        | priority 10 |
| TXT   | @                      | v=spf1 include:_spf-eu.ionos.com ~all   |             |
| CNAME | _dmarc                 | dmarc.ionos.co.uk                       |             |
| CNAME | s1-ionos._domainkey    | s1.dkim.ionos.com                       |             |
| CNAME | s2-ionos._domainkey    | s2.dkim.ionos.com                       |             |
| CNAME | autodiscover           | adsredir.ionos.info                     |             |

Check the MX priorities against what IONOS shows. If any of these are missing after the switch, email to
conv-ai.co.uk stops arriving.

## 3. Records to remove in Cloudflare

Delete these if the scan imported them, so the website's custom domain can be attached:

- A `@` 217.160.0.31 and AAAA `@` (the IONOS default page)
- A `q` 75.2.60.5 (a typo)
- CNAME `www` conv-ai1.netlify.app
- `_domainconnect` and `_dep_ws_mutex` (IONOS housekeeping)

## 4. Switch the nameservers

In IONOS: Domains & SSL > conv-ai.co.uk > Nameservers > use custom nameservers, and enter the two Cloudflare gives
you. Cloudflare emails you when the domain is active, usually within a few hours.

## 5. Website

Deploy the Worker (see README), then in Workers & Pages > conv-ai > Settings > Domains & Routes add the
custom domains `conv-ai.co.uk` and `www.conv-ai.co.uk`. Cloudflare creates the DNS records and certificates itself.

## 6. Platform

| Type  | Name | Target               | Proxy    |
|-------|------|----------------------|----------|
| CNAME | app  | conv-ai1.netlify.app | DNS only |

In Netlify, on the conv-ai1 site: Domain management > Add a domain > `app.conv-ai.co.uk`. Then update the allowed
site and redirect URLs in Supabase Auth, and set `APP_URL` in `public/index.html`.

## 7. Resend (sending the website's emails)

1. In Resend add the domain `conv-ai.co.uk`, EU region.
2. Add the records Resend shows, exactly, DNS only: a DKIM TXT record, plus an SPF TXT and an MX on a `send`
   subdomain. They sit alongside the IONOS mail records without conflict.
3. Do not add a second DMARC record. `_dmarc` already exists.
4. Verify in Resend, create an API key, and store it as the `RESEND_API_KEY` secret on the Worker.

## 8. Mailboxes

Receiving: Cloudflare Email Routing forwards hello@, admin@ and support@conv-ai.co.uk to Gmail.
Sending: Gmail "Send mail as" for each address, through smtp.resend.com (port 587, username `resend`,
a Resend API key as the password). The IONOS mail records are no longer used.

## 9. After go-live

- Google Search Console: add `conv-ai.co.uk` as a Domain property and submit `https://conv-ai.co.uk/sitemap.xml`.
- Google Analytics: create a GA4 property and put the measurement ID in `GA_ID`.
- Paste the URL into WhatsApp or LinkedIn to check the link preview.
