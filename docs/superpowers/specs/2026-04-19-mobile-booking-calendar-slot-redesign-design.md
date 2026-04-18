# Mobile Booking Calendar And Slot Redesign

**Date:** 2026-04-19

**Goal**

Refresh the mobile booking module's `Select Date` and `Available Time Slots` sections so they feel closer to the provided inspiration while preserving the existing dark AutoCare visual language. The redesign must also support booking up to 30 days in advance, which the current horizontal date strip does not handle well.

**Scope**

- Replace the current horizontal booking date scroller with a dark month-style calendar.
- Refresh the booking time slot section so it feels more premium, readable, and easier to scan.
- Support a rolling 30-day advance booking window in the booking UI.
- Preserve the current service selection, notes field, confirm action, and general booking flow.

**Out of Scope**

- Redesigning the `Select Service`, `Special Notes`, or tracking sections.
- Introducing backend persistence or real availability APIs.
- Adding time-of-day filters such as Morning, Afternoon, or Evening.
- Reworking booking confirmation or status logic beyond the new date-selection behavior.

## Current Context

The booking experience currently lives in `apps/mobile/src/screens/Dashboard.js`. It uses:

- `bookingDates` as a short, fixed list for the horizontal date cards
- `bookingTimeSlots` keyed by the selected date
- `BookingDateCard` for the date strip
- `BookingTimeSlot` for the two-column slot grid

This structure works for a handful of near-term dates, but it does not scale well to a 30-day booking window. A user trying to book a week or a month ahead would be forced to scroll horizontally through too many cards. The slot section is functional but visually flatter than the supplied reference.

## Product Direction

The redesign should borrow the first reference image's structure and clarity without abandoning the existing AutoCare tone. The result should feel:

- dark, branded, and premium
- cleaner and more spacious than the current booking panel
- more obviously interactive for both date and slot selection
- easier to understand when days or slots are unavailable

The screen should remain consistent with the rest of the mobile app's dark surfaces, orange brand accent, and rounded card language.

## Architecture

The implementation will stay local to the mobile booking presentation layer in `Dashboard.js`, with targeted style updates in the existing screen stylesheet.

Primary responsibilities:

- `bookingDates` generation or reshaping logic will provide a rolling 30-day calendar window.
- `BookingDateCard` will be replaced by a calendar-oriented date cell component or equivalent rendering block.
- `BookingTimeSlot` will remain the slot unit, but its presentation will be upgraded.
- Existing booking state such as `selectedBookingDateKey`, `selectedBookingTimeKey`, and confirm gating will remain the source of truth.

This keeps the redesign contained and avoids spreading booking-specific UI into unrelated components.

## Screen Design

### Select Date

The current horizontal strip will be replaced with a compact month calendar card placed under the `Select Date` label.

Calendar design requirements:

- dark elevated container with generous rounded corners
- month title row centered at the top
- previous and next month controls on the left and right
- weekday header row
- tap targets rendered as day cells in a 7-column grid
- selected day highlighted with the current orange brand accent
- available unselected days shown with clear white text on dark background
- unavailable days dimmed and non-interactive
- days outside the current visible month visually softened

The calendar should only allow selection within a rolling 30-day window starting from today. Dates outside that window must not appear as normal selectable dates. If the current month view includes dates that fall outside the booking window, they should render muted and inactive.

The initial selected date should default to the earliest available open day in the active window. If the selected date becomes invalid after navigation or data changes, the UI should fall back to the next available valid day.

### Available Time Slots

The time slot section will remain below the date picker, but its visual treatment will be upgraded to feel closer to the inspiration.

Slot section requirements:

- place slots inside a distinct dark panel rather than letting them float directly on the page
- keep the current two-column grid for familiarity and layout stability
- increase padding, corner radius, and contrast to make the section feel more intentional
- available slots should read as bold, tappable pills
- the selected slot should use the orange active state
- unavailable slots should remain visible, but dimmed with a clear status label such as `BOOKED`, `MAXED`, or `CLOSED`

When the selected date is unavailable, the section should keep the existing informational fallback pattern, but the message panel should visually align with the redesigned slot container.

## Interaction Design

The booking interaction will behave as follows:

1. The screen opens with the earliest valid bookable date selected.
2. The user can navigate month-to-month within the visible 30-day booking window.
3. Tapping an available day updates the selected date.
4. The available slot list refreshes for that selected date.
5. If the currently selected slot is not valid for the newly selected date, selection resets to the first available slot for that day.
6. The confirm button remains enabled only when a valid service, date, and available slot are selected.

Month navigation should not allow wandering into dates fully outside the 30-day window. If a next or previous month has no bookable dates, its navigation control should be disabled or hidden.

## Data Design

The current hard-coded `bookingDates` list should move from a short manually curated strip to a generated 30-day booking range.

The generated date data should support:

- a stable key for each day
- weekday label
- day number
- month label
- whether the day is within the current month view
- whether the day is open for booking
- whether the day is inside the 30-day booking window

`bookingTimeSlots` can continue to key off the date identifier already used by booking state. If the demo data remains static, it can be extended or mapped so every generated date has a predictable slot set and availability pattern.

## Error Handling And Empty States

- If a date has no available slots but is still open, the slot section should present a clear empty-state message rather than a broken or blank grid.
- If a day is closed, the user should understand that the shop is unavailable, not that the UI failed.
- If there are no valid booking dates in the current 30-day window, the booking section should show a single informative empty state and disable confirmation.

The redesign should prefer explicit unavailable states over hidden options so users understand the booking rules.

## Testing

Implementation verification should cover:

- rendering the calendar correctly for the current month
- navigating to the next month when part of the 30-day window crosses a month boundary
- preventing selection of dates outside the allowed window
- defaulting to the earliest available valid date
- resetting slot selection when changing to a date with different availability
- preserving the existing booking confirm gating logic

Visual verification should also confirm that:

- the new calendar reads clearly on small mobile screens
- the slot buttons remain easy to tap
- the orange active state stands out without clashing with the dark theme

## Recommended Implementation Approach

Use the month-style calendar redesign rather than stretching the horizontal date strip.

Why this approach:

- it is the best fit for a 30-day booking window
- it aligns most closely with the user's chosen inspiration
- it improves usability without requiring a full booking architecture rewrite
- it still keeps the rest of the booking module intact

This should be implemented as a focused booking UI refactor inside the existing mobile screen rather than a broad redesign of the entire booking module.
