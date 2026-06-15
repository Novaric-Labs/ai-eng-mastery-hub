# Novacademy auth emails

Supabase sends auth emails (magic link, etc.) and the template lives in the **dashboard**, not in
this repo — so this folder holds the source we paste in. `magic-link.html` is the branded
"Magic Link" body.

## Apply the magic-link template
1. Supabase Dashboard → **Authentication → Emails** (Email Templates) → **Magic Link**.
2. **Subject:** `Sign in to Novacademy`
3. **Message body (HTML):** paste the full contents of [`magic-link.html`](./magic-link.html).
   - Keep the `{{ .ConfirmationURL }}` and `{{ .Email }}` tokens — Supabase fills them in.
4. Save. Send yourself a test from the app's `/login` page.

> Do the same for **Confirm signup** if you enable email confirmation later — copy the same body and
> swap the heading to "Confirm your email".

## Make it clearly *from* Novacademy
The template above brands the email **content**. The **sender name/address** is separate:

- **Quick win (built-in email):** Dashboard → **Project Settings → Authentication → SMTP Settings**
  isn't required, but the built-in service sends from a generic Supabase address with limited
  from-name control and is **rate-limited (a few/hour)** — fine for testing, not for launch.
- **Recommended for production — custom SMTP** so mail comes from `Novacademy <noreply@novacademy.ai>`
  with good deliverability:
  1. Create a sender on **Resend** (or SendGrid/Postmark) and verify the `novacademy.ai` domain
     (add the DKIM/SPF DNS records they give you).
  2. Dashboard → **Project Settings → Authentication → SMTP Settings** → enable custom SMTP:
     - Sender name: `Novacademy`
     - Sender email: `noreply@novacademy.ai`
     - Host/port/user/pass: from your email provider.
  3. This also lifts the built-in rate limit.

## Notes
- The template is email-client-safe: table layout, inline styles, and a unicode `◆` "nova" mark
  (Gmail strips `<svg>` and many external images, so we avoid both).
- Colors match the light-theme brand (accent `#3b6fe0`, warm paper `#f6f4ef`). Adjust inline if the
  brand palette changes.
