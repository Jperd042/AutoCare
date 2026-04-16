# Admin Web Auth Register and OTP Refresh Design

## Goal

Refresh the web admin/employee authentication experience so the registration screen matches the provided visual direction more closely, while the OTP experience uses a clearer six-box code entry flow for registration and password-change verification.

## Scope

In scope:
- Refresh the visual design of the web registration screen while preserving the admin portal identity.
- Update the shared OTP modal and OTP input to use a stronger six-box verification experience.
- Apply the refreshed OTP experience to registration and change-password verification.
- Ensure successful registration OTP verification signs the user into the admin portal and lands on the dashboard.
- Ensure failed OTP verification shows clear error feedback and does not navigate away.

Out of scope:
- Rebuilding the dashboard layout.
- Changing the web app from admin/employee branding to customer branding.
- Replacing mock OTP verification or adding backend email delivery.
- Broad login-screen redesign beyond changes required by the shared OTP modal.

## Current Context

The active web auth flow lives in:
- `apps/web/src/components/layout/AppShell.js`
- `apps/web/src/screens/Register.js`
- `apps/web/src/screens/Login.js`
- `apps/web/src/screens/AccountSecurity.js`
- `apps/web/src/components/OtpModal.js`
- `apps/web/src/components/OtpInput.js`

Current behavior already includes:
- A dedicated registration screen with a left hero and right form panel.
- A shared OTP modal reused by login, registration, and password-change verification.
- Six individual OTP inputs in the shared component.
- OTP usage for registration and password changes.

The main gaps are presentation quality, consistency with the reference images, and stronger success/error handling clarity.

## Design Summary

The update will keep the existing admin portal structure but refine the auth surfaces into a more intentional dark luxury-industrial style:
- The registration page remains a split-screen admin portal layout on large screens.
- The right-side register form becomes tighter, cleaner, and more reference-aligned.
- The shared OTP modal becomes the single polished verification surface for register and change-password flows.
- OTP inputs remain six boxes, but their spacing, focus states, error treatment, and prototype hint treatment become more deliberate and visually prominent.

## Visual Direction

### Register Screen

The register page should stay visually aligned with the current admin portal login screen:
- Dark base background.
- Orange-to-bronze accent system.
- Automotive workshop feel rather than generic SaaS styling.
- Strong heading hierarchy, with a more premium card-like form area.

The register form should move closer to the first reference by:
- Tightening vertical rhythm so the form reads as one composed block rather than a long stack.
- Using stronger label contrast and more polished field chrome.
- Giving the password rules panel a clearer hierarchy and stronger active/pass states.
- Making the primary action feel more intentional and prominent.
- Preserving the current desktop hero panel and mobile fallback branding.

Copy should remain admin-oriented:
- The register screen continues to speak to admin or employee account setup.
- References to general customer onboarding should not be introduced.

### OTP Modal

The OTP modal should move closer to the second reference by:
- Using a darker, tighter modal card with a soft blurred overlay.
- Presenting the title, masked email, prototype code hint, and verification action in a stronger hierarchy.
- Keeping the six-digit input as separate boxes.
- Making the six boxes feel like the main interaction target through stronger sizing, focus glow, and error styling.
- Maintaining the orange accent language from the auth screens.

## Component Design

### Register Screen Responsibilities

`apps/web/src/screens/Register.js` remains responsible for:
- Collecting admin registration details.
- Validating name, email, password, and confirmation.
- Opening OTP only after local validation succeeds.
- Completing registration only after OTP success.

Behavioral adjustments:
- Registration still stays mock/local for now.
- After OTP success, registration should create the user session immediately through the existing `onRegister` path.
- The user should land in the authenticated dashboard state, not back on the auth view.

### Shared OTP Modal Responsibilities

`apps/web/src/components/OtpModal.js` remains the shared verification container for:
- Login verification.
- Registration verification.
- Password-change verification.

The modal should support purpose-specific copy while sharing one visual structure:
- `login`
- `registration`
- `password-change`

The modal should own:
- Code state.
- Verification loading state.
- Resend timer state.
- Inline validation state.
- Purpose-specific copy.

It should not own final destination routing; instead, it should call `onVerify` after a successful code check and let the parent screen handle the next step.

### OTP Input Responsibilities

`apps/web/src/components/OtpInput.js` remains responsible for the digit-box interaction:
- One visible box per digit.
- Auto-advance on entry.
- Backspace-to-previous behavior.
- Paste support for full codes.
- Clear focus and error states.

The refreshed design should improve usability without changing the component contract expected by the modal.

### Password Change Responsibilities

`apps/web/src/screens/AccountSecurity.js` should keep its current staged flow:
- Validate current password and new password locally.
- Open OTP only when password inputs are valid.
- On OTP success, complete the password update and remain on the account security page.
- Clear password fields and show success feedback after completion.

## Data Flow

### Registration Flow

1. Admin enters registration details in `Register.js`.
2. Local validation runs.
3. If valid, `OtpModal` opens with `purpose="registration"`.
4. Admin enters six-digit code.
5. If the code matches the prototype code, `OtpModal` calls `onVerify`.
6. `Register.js` completes the existing registration callback.
7. `AppShell.js` stores the authenticated user session.
8. The app renders the dashboard because the user is now authenticated.

### Change Password Flow

1. Admin enters current password, new password, and confirmation in `AccountSecurity.js`.
2. Local validation runs.
3. If valid, `OtpModal` opens with `purpose="password-change"`.
4. Admin enters six-digit code.
5. If the code matches, `OtpModal` calls `onVerify`.
6. `AccountSecurity.js` completes the password update.
7. Success toast appears and the user remains on the security screen.

## Error Handling

### Register Errors

The register form should continue to show field-level validation messages for:
- Missing name.
- Invalid email.
- Weak password.
- Password mismatch.

No OTP modal should open when register validation fails.

### OTP Errors

Wrong-code behavior should be consistent across purposes:
- Keep the modal open.
- Mark the OTP boxes with an error state.
- Show inline invalid-code feedback near the input.
- Show a toast/pop-up style confirmation of failure where the surrounding screen already supports it.

Incomplete-code behavior:
- Prevent verification when fewer than six digits are present.
- Show a concise validation message rather than navigating or silently failing.

### Success Handling

On OTP success:
- Registration should authenticate and enter the dashboard.
- Password change should stay in place and confirm success.

## Testing Strategy

The implementation should be covered with focused UI behavior tests for:
- Register form validation blocking OTP open on invalid input.
- OTP modal rendering correct purpose-specific text.
- OTP input accepting paste and distributing digits correctly.
- Wrong OTP showing error feedback without invoking the parent success handler.
- Successful registration OTP invoking the registration callback and transitioning to the authenticated state.
- Successful password-change OTP invoking the password change completion path while remaining on the security screen.

Manual verification should also cover:
- Desktop register layout.
- Mobile register layout.
- OTP modal appearance for register and password-change flows.
- Focus, backspace, and paste behavior in the six OTP boxes.
- Toast/error messaging for invalid code.

## Files Expected to Change

Primary files:
- `apps/web/src/screens/Register.js`
- `apps/web/src/components/OtpModal.js`
- `apps/web/src/components/OtpInput.js`
- `apps/web/src/screens/AccountSecurity.js`

Possible support files:
- shared auth styling in existing CSS or utility-class structures only if necessary.

## Risks and Constraints

- The app currently uses local/mock auth behavior, so all navigation and verification outcomes must continue to work without backend support.
- The shared OTP modal is reused by multiple flows, so changes must preserve login compatibility even though login is not the main redesign target.
- The visual refresh should improve the current admin portal style rather than accidentally shifting the product into a customer-facing look.

## Acceptance Criteria

- The web register screen visibly reflects the first reference more closely while staying on-brand for admin/employee use.
- OTP entry uses six distinct boxes with improved polish and feedback.
- Registration OTP success signs the user in and shows the dashboard.
- Wrong OTP shows clear failure feedback and keeps the user in the verification step.
- Password-change OTP uses the same updated shared experience and returns the user to the security screen on success.
