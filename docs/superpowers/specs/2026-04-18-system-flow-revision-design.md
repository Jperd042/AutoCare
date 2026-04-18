# System Flow Revision Design

**Date:** 2026-04-18

**Goal**

Revise the AUTLOCARE end-to-end flow documentation so the written Notion spec and the diagrams stay aligned, domain responsibilities are clearer, missing operational modules are added, and the e-commerce/catalog behavior reflects the real intended product rules.

**Scope**

- Restructure the flow documentation into one master diagram plus focused domain subflows.
- Clarify which nodes are core state owners versus downstream support flows.
- Add the missing `Back Job Flow`.
- Add the missing web `Shop Product Admin` flow that feeds the mobile shop.
- Update onboarding, service, insurance, and e-commerce flow details to match the approved product rules.
- Define the catalog, cart, pricing, publishing, and checkout rules that should appear in the revised documentation.

**Out of Scope**

- Implementing backend, mobile, or web code changes.
- Redesigning support/chat as a standalone product unless it is explicitly added to a later scope.
- Defining database schemas or API contracts in full implementation detail.
- Reworking unrelated UI modules outside the flow documentation effort.

## Current Context

The current AUTLOCARE flow materials are split across a Notion page and multiple diagrams. The written page already describes the platform in a more structured way than the diagrams, but the diagram set still has several gaps:

- missing `Back Job Flow`
- crowded combined diagrams that mix screens, states, jobs, and outcomes with the same weight
- support flows such as notifications, timeline refresh, analytics refresh, AI jobs, and email delivery appearing too close to the primary business path
- incomplete e-commerce administration coverage, especially for product publishing from web admin to mobile catalog
- ambiguity in onboarding sequencing after account activation

The repo already contains working inventory- and shop-related surfaces, including:

- `apps/web/src/screens/InventoryWorkspace.js`
- `apps/web/src/screens/InventoryManager.js`
- `apps/web/src/screens/Shop.js`
- `packages/shared/services/operationsStore.js`

That confirms the product already has inventory and checkout groundwork. The main documentation gap is a clear `Shop Product Admin` domain that explains how web-managed products become visible and purchasable in mobile.

## Product Direction

The revised flow set should be easier to read, easier to maintain, and much harder to misinterpret.

The intended direction is:

- one high-level master flow for system understanding
- one focused subflow per major domain
- clear ownership of state-changing steps
- support flows shown as downstream reactions rather than primary state owners
- explicit business rules for shop publishing, cart behavior, payment states, and lifecycle updates

The flow set should be strong enough to guide design, implementation planning, review, and team discussion without requiring readers to infer missing behavior from scattered notes.

## Documentation Architecture

The revised documentation should use a `master diagram + domain subflows` structure.

### Master Diagram

The master diagram should show only the major domains and their handoffs:

- Customer Onboarding and Identity
- Main Service Flow
- Insurance Flow
- Back Job Flow
- E-Commerce Flow
- Shop Product Admin
- Loyalty / Rewards
- Staff Provision
- Support flows as downstream branches

The master diagram should remain intentionally high-level. It should not contain every internal rule, cart behavior, QA substep, or async support job in the main line.

### Domain Subflows

Each major domain should have its own detailed flow:

- `Onboarding and Identity`
- `Main Service Operations`
- `Insurance Inquiry and Claim Tracking`
- `Back Job / Return / Rework`
- `E-Commerce Purchase Lifecycle`
- `Shop Product Admin and Catalog Publishing`

This structure keeps the master flow readable while still giving each team enough detail to work from.

## Notation Rules

The diagrams should apply one clear meaning per node type.

Recommended conceptual types:

- `Screen / Entry Point`: user-facing page, portal, or module entry
- `Action`: explicit human action such as register, add vehicle, create order, update claim
- `State Owner`: step that changes official business state
- `Decision`: branching state or review decision
- `Support Flow`: notification, email delivery, timeline refresh, analytics refresh, AI assist, retry job

Recommended visual rules:

- core state path uses solid arrows
- support or downstream reactions use dashed arrows
- support jobs use lighter styling or smaller boxes
- decision nodes are visually distinct from screens and actions
- terminal business outcomes should not be styled the same as screens

This prevents support nodes such as `Timeline Update`, `AI QA Job`, or `Email Delivery` from being mistaken as the source of truth for business state.

## Revised Domain Flows

### 1. Onboarding and Identity

Approved sequence:

`Mobile Entry -> Register -> Identity Verification / OTP Activation -> Account Active -> Profile Setup -> Add Vehicle -> Customer Home`

After that sequence completes, the customer can use:

- booking
- insurance inquiry
- loyalty
- shop
- timeline/history/support views

Operational rule:

- booking and insurance usage assume the account is active and at least one vehicle is saved

### 2. Main Service Operations

Approved high-level flow:

`Book Service -> Slot Check -> Booking Request -> Booking Queue -> Staff Confirm / Reschedule / Decline`

If confirmed:

`Create Job Order -> Assign Technician -> Work Update -> Upload Evidence -> QA Review`

QA branches:

- `Release Approved`
- `Rework Needed -> Work Update / Upload Evidence`

After release approval:

`Service Invoice Finalized -> Service Payment Recorded -> Evaluate Earning Rules -> Points Awarded`

Downstream support branches:

- timeline refresh
- customer history refresh
- analytics refresh
- customer notices

### 3. Insurance Inquiry and Claim Tracking

Approved flow:

`Insurance Inquiry -> Attach Details/Documents -> Insurance Queue -> Staff Claim Update -> Customer Claim Tracking`

Downstream reflection:

- update vehicle timeline where appropriate
- update customer history where appropriate

This makes the customer-facing status loop explicit instead of leaving it implied.

### 4. Back Job / Return / Rework

Approved standalone flow:

`Customer Return / Complaint -> Open Back Job -> Link to Original Work Record -> Return Inspection -> Classify Case`

Case classification:

- rework
- warranty-related return
- new concern

Then:

`Track Back Job -> Resolve / Close -> Vehicle Lifecycle History Update`

This domain must stay separate from the standard happy-path service release flow.

### 5. E-Commerce Purchase Lifecycle

Approved customer flow:

`Mobile Shop Browse -> Search / Filter / Sort -> Product Detail -> Cart -> Checkout -> Create Order`

Then:

`Reserve or Deduct Stock -> Invoice Created -> Payment Status`

Payment status states:

- `Pending`
- `Partial`
- `Paid`

If paid:

- fulfillment proceeds
- loyalty can be evaluated
- activity/history/analytics can refresh

Checkout rule:

- customers may buy products from multiple categories in one order

### 6. Shop Product Admin and Catalog Publishing

Approved web-admin flow:

`Web Admin Product Management -> Create/Edit Product -> Upload Images -> Assign/Create Category -> Set Stock and Price -> Publish`

This module is the missing operational owner for what the mobile shop displays.

It should include:

- product creation
- product editing
- product image upload
- category creation and assignment
- stock and price management
- publish / unpublish / archive controls

## Approved Catalog and Cart Rules

The revised documentation should explicitly state these rules.

### Product Visibility

- only `published` products appear in the mobile shop
- admins can publish immediately on creation
- admins can edit published products
- changes to published products sync to mobile immediately
- admins can unpublish or archive products later
- unpublished or archived products disappear from the mobile shop

### Product Form Rules

Required on create:

- `name`
- `price`
- `description`
- `category`
- at least `one image`
- `stock`

Optional on create:

- `SKU / product code`

Description rule:

- descriptions are `plain text` only

Media rule:

- a product may have a single image or multiple images

Category rule:

- admins can create new categories directly from web admin

### Stock and Mobile Catalog Rules

- published products with `0` stock remain visible in mobile
- `0` stock products should display as `Out of Stock`
- stock must exist at creation time, even if it later reaches zero

### Cart Rules

- if a product is unpublished or archived, it is removed from customer carts automatically
- cart pricing updates automatically to the latest published product price

### Mobile Shop Discovery Rules

Mobile customers can:

- search products
- filter by category
- sort by `Newest`
- sort by `Price: Low to High`
- sort by `Price: High to Low`
- sort by `Name A-Z`

## Support Flow Boundaries

The documentation should explicitly treat the following as downstream support flows unless a later scope says otherwise:

- email delivery
- notifications
- timeline refresh
- customer activity/history refresh
- analytics refresh
- AI assistance
- retry jobs

These flows may react to state changes, but they do not replace the primary state owners.

Examples:

- `Release Approved` owns the release decision, not `AI QA Job`
- `Service Payment Recorded` owns the payment event, not `Analytics Refresh`
- `Claim Update` owns claim progression, not `Claim Notice`

## Scope Handling for Support and Chat

Support and chatbot behavior should remain a separate support domain unless the team explicitly chooses to model it in detail in this diagram set.

If included later, it should be presented as:

- FAQ / common inquiry handling
- escalation to human support
- reviewed AI summaries as assistive tools

It should not be drawn in a way that suggests autonomous customer-facing AI decision ownership.

## Risks and Mitigations

### Risk: The master diagram becomes crowded again

Mitigation:

- keep only domain-level nodes in the master diagram
- move business rules and detailed branching into subflows

### Risk: Text and diagrams drift apart again

Mitigation:

- update Notion and diagrams from the same approved checklist
- keep identical domain names and sequence labels across both

### Risk: Support flows are misread as core state owners

Mitigation:

- use distinct notation rules
- keep support branches visually secondary
- label them explicitly as downstream or support flows where helpful

### Risk: Shop rules remain partially implied

Mitigation:

- document publish, archive, pricing, stock, cart, and mobile visibility rules explicitly
- place `Shop Product Admin` in the web-admin side of the flow set, not as an afterthought under inventory only

## Success Criteria

The revision is successful when:

- the documentation is split into a readable master diagram plus domain subflows
- `Back Job Flow` is fully represented
- support flows are visually distinct from business state owners
- onboarding clearly reads as `activation -> profile setup -> add vehicle`
- service flow shows the booking decision branch and the QA rework loop
- insurance clearly reflects back into customer tracking and lifecycle history where appropriate
- e-commerce explicitly shows `pending`, `partial`, and `paid`
- the web `Shop Product Admin` module is included and clearly owns mobile shop publishing
- the approved catalog, cart, and pricing rules are represented consistently
- the Notion text and diagrams no longer contradict each other
