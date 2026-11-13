# Conv-AI website (Cloudflare)

The marketing site for `https://conv-ai.co.uk`, deployed as a Cloudflare Worker with static assets.
The platform stays on Netlify at `app.conv-ai.co.uk`.

```
public/                 everything visitors download
  index.html            the site (sections plus #privacy and #terms)
  404.html              not-found page
  og.png                link preview image (1200x630)
  favicon*, icon-*, apple-touch-icon.png, site.webmanifest
  robots.txt, sitemap.xml
  assets/logo.png, logo-email.png
  _headers              security and cache headers
src/worker.js           handles POST /api/contact and emails it through Resend
src/email.js            branded email templates and the email signature
email/                  rendered previews of the emails and signature
wrangler.jsonc          Cloudflare configuration
DNS-SETUP.md            moving conv-ai.co.uk from IONOS DNS to Cloudflare
```

## Deploy

```
npm install
npx wrangler login
npx wrangler deploy
```

Or push this folder to a Git repository and connect it in Cloudflare under Workers & Pages > Create > Import a
repository. Deploy command: `npx wrangler deploy`.

Dragging the `public` folder into the Cloudflare dashboard uploads the pages only. The contact form needs
`src/worker.js` too, which only deploys through the two routes above.

Then attach the domain: Workers & Pages > conv-ai > Settings > Domains & Routes > Add > Custom domain,
for `conv-ai.co.uk` and again for `www.conv-ai.co.uk`. See `DNS-SETUP.md` first.

## Contact form and Resend

The form posts to `/api/contact`. The Worker emails the enquiry to `hello@conv-ai.co.uk` and sends a branded
confirmation to the sender, both from `Conv-AI <hello@conv-ai.co.uk>`.

**The form does not work until Resend is set up.** There is no stored copy of submissions, so without the API key
the visitor is told it did not send and is asked to email hello@conv-ai.co.uk instead.

1. In Resend, add and verify `conv-ai.co.uk` (section 4 of `DNS-SETUP.md`) and create an API key.
2. `npx wrangler secret put RESEND_API_KEY`, or add it as a Secret under the Worker's Settings > Variables and Secrets.
3. Send a test submission from the live site.

## Google Analytics

Set `GA_ID` near the top of the script in `public/index.html` to your GA4 measurement ID (`G-...`). Visitors then
see a consent banner and Analytics loads only if they accept. With `GA_ID` empty there is no banner and no tracking.

## Log in

The Log in buttons go to `https://app.conv-ai.co.uk` (`APP_URL` near the top of the script in `public/index.html`).

## Trusted by

Put real firms in `TRUSTED_BY` in the same script: either a name, or `{name:'Firm', logo:'/assets/trusted/firm.png'}`
with the artwork saved in `public/assets/trusted/`. The section stays hidden on the live site until you do.

## Before going live

- Confirm the retention period highlighted in the privacy policy (24 months).
- Register Lucere TG Ltd with the ICO.
- Have the privacy policy and terms of use reviewed by whoever advises you.
- Review the About copy, the individuals disclaimer and the sample title data.
