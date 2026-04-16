# Mobile Auth UI Refresh Design

**Date:** 2026-04-15

**Goal**

Refresh the Expo mobile `Login` and `Register` screens so they feel much closer to the provided reference images: darker and cleaner overall, with a stronger branded auth shell, tighter form styling, and a shorter registration flow built around the six reference fields.

**Scope**

- Refresh `Login` visual design to closely follow the provided mobile auth inspiration.
- Refresh `Register` visual design and simplify it to the shorter inspiration-led field set.
- Update shared auth UI components so the new look is consistent across auth-related screens.
- Preserve the existing mobile auth flow behavior for login, registration success, forgot password entry, and OTP handoff.

**Out of Scope**

- Redesigning OTP screens beyond inheriting the shared shell improvements.
- Adding social login behavior.
- Adding a second onboarding step for vehicle details.
- Introducing new backend or persistence behavior.

## Current Context

The mobile app already has a reusable auth shell through `AuthFrame`, `FormField`, `PasswordField`, and `PasswordChecklist`. `LoginPage` and `RegisterPage` use these components and already contain the correct high-level structure for an auth flow. The current visual language is serviceable but more generic than the reference: fields are roomy, decorative treatment is lighter, and the register flow includes more data than the design direction calls for.

The existing register flow currently requires:

- first name
- last name
- email
- phone number
- birthday
- license plate
- vehicle model
- password
- confirm password

For this refresh, the register form will be reduced to:

- first name
- last name
- email
- phone number
- password
- confirm password

## Product Direction

The design direction should stay close to the supplied inspiration without becoming a brittle one-off copy. The goal is not pixel matching every screenshot, but matching the same tone:

- dark navy-charcoal background
- high-contrast white headlines
- soft bluish secondary text
- orange brand glow for the icon badge and primary CTA
- uppercase compact field labels
- rounded dark inputs with clearer focus rings
- more premium spacing and vertical rhythm

The overall feel should be clean, branded, and intentional rather than dense or utility-first.

## Architecture

The refresh will be implemented by upgrading the shared mobile auth presentation layer first, then rebuilding `LoginPage` and `RegisterPage` on top of those shared pieces.

Shared visual responsibilities will stay in:

- `apps/mobile/src/components/AuthFrame.js`
- `apps/mobile/src/components/FormField.js`
- `apps/mobile/src/components/PasswordField.js`
- `apps/mobile/src/components/PasswordChecklist.js`
- `apps/mobile/src/theme.js`

Screen-specific layout and copy responsibilities will stay in:

- `apps/mobile/src/screens/LoginPage.js`
- `apps/mobile/src/screens/RegisterPage.js`

Validation and data shaping responsibilities will stay in:

- `apps/mobile/src/utils/validation.js`

This keeps the auth UI cohesive and avoids duplicating one-off styling across multiple screens.

## Screen Design

### Login

`LoginPage` should closely resemble the first inspiration image:

- branded header badge and brand lockup at the top
- large welcome headline
- concise sign-in subtitle
- email field
- password field
- right-aligned forgot-password action
- full-width glowing orange `Sign In` button with arrow icon
- bottom row prompting users to go to sign-up

The visual result should feel lighter and cleaner than the current screen, with fewer competing borders and more emphasis on the headline and CTA.

The social buttons shown in the reference will not be added because they do not exist in the current product behavior and would create fake affordances. The spacing and balance of the rest of the screen should still evoke the same design direction without them.

### Register

`RegisterPage` should follow the second, third, and fourth inspiration images:

- back-to-login text link at the top
- shared brand lockup
- large `Create Account` headline
- concise subtitle
- first and last name on one row
- email field
- phone number field
- password field
- inline password checklist panel
- confirm password field
- agreement copy for Terms of Service and Privacy Policy
- full-width glowing orange `Create Account` button
- bottom row prompting users to go back to sign-in

The register screen should feel shorter and more intentional than the current version. Removed fields must not leave awkward gaps or dead logic in the layout.

## Component Design

### AuthFrame

`AuthFrame` will become the main branded shell for auth screens.

Changes:

- deepen the background contrast
- strengthen the orange badge glow
- tune decorative circular background shapes to match the reference mood
- tighten hero spacing
- keep the back link understated
- preserve animation, but keep it subtle and fast

`AuthFrame` should remain generic enough to support login, register, forgot password, and OTP screens.

### FormField

`FormField` will be updated to better match the dark rounded inputs from the references.

Changes:

- slightly more compact vertical rhythm
- cleaner label spacing
- darker fill
- softer but more visible border treatment
- stronger primary-colored focus state
- improved placeholder contrast while still reading as secondary

Error and helper text should remain below the field and continue using the current validation model.

### PasswordField

`PasswordField` should visually match `FormField` exactly, including focus behavior, icon spacing, and border treatment. The visibility toggle should remain, but feel quieter and more integrated into the field chrome.

### PasswordChecklist

`PasswordChecklist` should be restyled to feel like part of the form shown in the inspiration:

- same dark card family as the inputs
- compact uppercase title
- neater spacing between rules
- stronger completed state
- clearer alignment between icon boxes and text

The checklist should still appear when the password field is focused or already contains text.

## Data Flow

### Login Flow

The login flow remains unchanged:

1. User enters email and password.
2. Existing validation runs.
3. Invalid fields show inline errors.
4. Valid credentials continue to the OTP screen.

No changes are required to the login payload or navigation targets.

### Register Flow

The register flow keeps the same high-level outcome, but with a simplified input contract.

New register input contract:

- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `password`
- `confirmPassword`

Removed from register input:

- `birthday`
- `licensePlate`
- `vehicleModel`

Saved account object after successful register should still include:

- trimmed first and last name
- normalized email
- normalized phone number
- generated username
- password

Fields removed from the register UI should no longer be required by validation and should not block account creation.

## Validation and Error Handling

### Login

Keep the existing login validation behavior:

- email validation on blur
- incorrect credentials shown on the password field
- forgot-password action unchanged

### Register

Register validation should be updated to reflect the reduced form:

- first name required
- last name required
- email must be valid
- phone number must be a valid PH mobile number
- password must satisfy current password rules
- confirm password required
- confirm password must match password

Validation for birthday, license plate, and vehicle model must be removed from the register form path.

### Error Presentation

The error model remains inline and field-specific. The redesign should improve clarity, not change the validation philosophy. Error states should remain obvious with:

- colored border state
- visible error text below the field
- clear mismatch messaging for confirm password

## Accessibility and Interaction Notes

- Keep text legible against the dark background.
- Maintain adequate touch target sizes for buttons and password toggles.
- Preserve keyboard-safe scrolling and input focus behavior through `ScreenShell`.
- Keep the back action clear and reachable.
- Avoid decorative changes that reduce the clarity of focus or error states.

## Testing Strategy

This refresh is primarily a UI and form-contract change, so testing should focus on behavior that could regress:

- login validation still blocks invalid sign-in
- login still navigates to OTP on valid credentials
- register validation uses only the new six-field contract
- register still creates an account and returns to login with the prefilled email
- password checklist still appears when expected
- forgot password and OTP screens still render correctly inside the updated auth shell

Verification should be done in the Android emulator first, with the Expo mobile app as the source of truth for spacing, shadow, and input feel.

## Implementation Notes

- Keep changes inside `apps/mobile`.
- Prefer shared-component updates over duplicating styles per screen.
- Preserve the existing auth animation feel, but reduce anything that feels heavy or flashy.
- Match the inspiration closely in tone and layout, while respecting the existing product behavior.

## Risks and Mitigations

### Risk: Register simplification breaks assumptions elsewhere

Mitigation:

- update `validateRegisterForm` to match the new shorter contract
- keep account creation payload fields limited to what the form still collects
- verify the resulting account still works in login and OTP flows

### Risk: Shared shell changes unintentionally worsen forgot-password and OTP screens

Mitigation:

- keep the shared shell generic
- manually verify `ForgotPasswordEmail`, `ForgotPasswordOTP`, and `OTPScreen` in the emulator after the auth refresh

### Risk: Styling gets too decorative and hurts usability

Mitigation:

- prioritize readable spacing and state clarity over adding more effects
- use the reference as direction, not an excuse to reduce form clarity

## Success Criteria

The work is successful when:

- mobile `Login` clearly reflects the reference direction
- mobile `Register` is shorter and visually aligned with the provided inspiration
- the auth UI feels cohesive and clean across shared auth screens
- login, register, forgot-password, and OTP flows still work in the Android emulator
- register no longer depends on birthday, license plate, or vehicle model
