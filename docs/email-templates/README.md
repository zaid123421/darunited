# Account invitation email templates (frontend handoff)

Static deliverables for the **Activate Account / invitation** email.
These files are **not** wired into the Next.js app. Backend should adapt them into Laravel mail views.

## Files

| File | Purpose |
|---|---|
| `account-invitation.html` | Branded, email-safe HTML (tables + inline CSS) |
| `account-invitation.txt` | Plain-text fallback |

## Brand tokens used

From the dashboard palette:

- Black `#0e1010`
- Card `#1a1c1c`
- Red CTA `#e91c24`
- White text `#faf9f8`
- Grey muted `#b7b7b7`

## Placeholder mapping

| Template token | Laravel Blade variable (current mail) |
|---|---|
| `{{name}}` | `{{ $name }}` |
| `{{role}}` | `{{ str_replace('_', ' ', $role) }}` (or pre-format in PHP) |
| `{{activationUrl}}` | `{{ $activationUrl }}` |
| `{{expiresAt}}` | `{{ $expiresAt }}` |

### Logo

The HTML currently points to a **local preview path**:

`../../public/logos/full-red-white.png`

That works when you open the file from this repo in a browser.  
For a real emailed message, replace `src` with an **absolute HTTPS** URL, for example:

`https://YOUR_DASHBOARD_HOST/logos/full-red-white.png`

Email clients cannot load relative paths or `localhost` images.

## Suggested backend steps

1. Open current mail:
   `resources/views/mail/accounts/account-invitation.blade.php`
2. Either:
   - Switch the Mailable to an HTML view and paste/adapt `account-invitation.html` with Blade variables, **or**
   - Keep Markdown and only borrow copy/structure from this design.
3. Attach the plain-text version as the text part of the mailable when possible.
4. Preview in a real client (Gmail / Outlook) before production.

## Current backend reference

- Mailable: `App\Mail\AccountInvitationMail`
- Subject today: `Your DAR United account invitation`
- Activation page (frontend): `/activate-account?token=...`

## Out of scope here

- No OTP email redesign in this folder
- No Laravel Blade edits from the frontend repo
