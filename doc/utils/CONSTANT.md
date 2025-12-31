# Constants

This page provides an overview of the shared constants used across the application.
Instead of linking to files, each section briefly explains what the given constant group is responsible for.

## Table of contents

- [Base URL](#base-url)
- [Dialog buttons](#dialog-buttons)
- [Dialog contents](#dialog-contents)
- [Dialog form field models](#dialog-form-field-models)
- [Error messages](#error-messages)
- [Hardness values](#hardness-values)
- [Orders](#orders)
- [Saved game statuses](#saved-game-statuses)
- [SessionStorage prefix](#sessionstorage-prefix)

---

## Base URL

Defines the backend base address used by the HTTP layer to build full API endpoints.
This centralizes the backend URL so it can be changed in one place without touching request logic.

**File:** [base-URL.constant.ts](../../src/app/utils/constants/base-URL.constant.ts)

---

## Dialog buttons

Contains the predefined button templates/configurations used by dialogs (e.g. accept/reject/trigger buttons).
It helps keep dialog button definitions consistent across the UI.

**File:** [dialog-button.constant.ts](../../src/app/utils/constants/dialog-button.constant.ts)

---

## Dialog contents

Stores the available dialog content identifiers and/or templates that describe which dialog UI should be shown.
This makes dialog selection type-safe and consistent throughout the app.

**File:** [dialog-content.constant.ts](../../src/app/utils/constants/dialog-content.constant.ts)

---

## Dialog form field models

Defines the available form field model keys used by dialog-driven forms (e.g. login, registration, settings).
It provides a strongly-typed way to reference form structures across the application.

**File:** [dialog-form-field-model.constant.ts](../../src/app/utils/constants/dialog-form-field-model.constant.ts)

---

## Error messages

Maps validation error keys to human-readable error messages.
Used by the form validation/error layer to display consistent feedback for invalid inputs.

**File:** [error-message.constant.ts](../../src/app/utils/constants/error-message.constant.ts)

---

## Hardness values

Defines the supported difficulty levels (and their labels/order).
Used by the game settings UI and by the game logic/AI integration to keep difficulty handling consistent.

**File:** [hardness.constant.ts](../../src/app/utils/constants/hardness.constant.ts)

---

## Orders

Contains constants describing valid game/order types used in the application logic.
Helps avoid magic strings and keeps ordering-related values centralized.

**File:** [order.constant.ts](../../src/app/utils/constants/order.constant.ts)

---

## Saved game statuses

Defines the possible states of a saved game (e.g. saved, loaded, updated, etc.).
Used to keep save/load state transitions consistent and type-safe.

**File:** [saved-game-status.constant.ts](../../src/app/utils/constants/saved-game-status.constant.ts)

---

## SessionStorage prefix

Defines the prefix used for keys stored in `sessionStorage`.
Helps prevent key collisions and keeps storage-related naming consistent.

**File:** [sessionstorage-prefix.constant.ts](../../src/app/utils/constants/sessionstorage-prefix.constant.ts)
