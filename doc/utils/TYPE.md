# Types

This page provides an overview of the shared **TypeScript types** used across the application.
Each section explains what the type is used for and links to the source file.

## Table of contents

- [DialogButton](#dialogbutton)
- [DialogContent](#dialogcontent)
- [ErrorKeys](#errorkeys)
- [ErrorValues](#errorvalues)
- [FieldKey](#fieldkey)
- [FormFieldModel](#formfieldmodel)
- [GameOrder](#gameorder)
- [Hardness](#hardness)
- [savedGameStatus](#savedgamestatus)

---

## DialogButton

A strict union type describing which **action** a dialog button performs.

**What it’s for**

- Makes dialog button handling type-safe (no “magic strings”).
- Used by dialog UI logic and dialog configuration structures.

**How it looks (shape)**

- `"trigger" | "accept" | "reject"`

**File:** [dialog-button.type.ts](../../src/app/utils/types/dialog-button.type.ts)

---

## DialogContent

A union type representing all valid dialog content names (derived from a constant list).

**What it’s for**

- Type-safe dialog opening, so only existing dialog identifiers can be used.

**How it looks (shape)**

- `(typeof DIALOG_CONTENT)[number]`

**File:** [dialog-content.type.ts](../../src/app/utils/types/dialog-content.type.ts)

---

## ErrorKeys

Extracts the **valid error keys** from the `ERROR_MESSAGES` map.

**What it’s for**

- Keeps validation keys in sync with the central error message map.
- Prevents typos in error handling / form validation.

**How it looks (shape)**

- Derived from the Map’s key type (`Map<infer K, any> ? K : never`)

**File:** [error-messages.type.ts](../../src/app/utils/types/error-messages.type.ts)

---

## ErrorValues

Extracts the **valid error message values** from the `ERROR_MESSAGES` map.

**What it’s for**

- Type-safe access to the possible error message strings.

**How it looks (shape)**

- Derived from the Map’s value type (`Map<any, infer V> ? V : never`)

**File:** [error-messages.type.ts](../../src/app/utils/types/error-messages.type.ts)

---

## FieldKey

Represents valid keys for dialog-related form sections.
It is derived from `DialogContent`, but excludes `null` / `undefined`.

**What it’s for**

- Safe indexing when mapping dialog content → form structures (e.g. FormTemplate maps).

**How it looks (shape)**

- `NonNullable<DialogContent>`

**File:** [dialog-form-field-model.type.ts](../../src/app/utils/types/dialog-form-field-model.type.ts)

---

## FormFieldModel

A union type of allowed form model identifiers (derived from a constant list).

**What it’s for**

- Provides a strongly-typed set of model keys used by dynamic dialog forms.
- Prevents mismatches between form metadata and emitted form values.

**How it looks (shape)**

- `typeof FORM_FIELD_MODELS[number]`

**File:** [dialog-form-field-model.type.ts](../../src/app/utils/types/dialog-form-field-model.type.ts)

---

## GameOrder

Union type describing valid ordering options for listing saved games.

**What it’s for**

- Keeps sorting options consistent across UI/store/backend request building.
- Always stays in sync with the `ORDERS` constant array.

**How it looks (shape)**

- `(typeof ORDERS)[number]`

**File:** [order.type.ts](../../src/app/utils/types/order.type.ts)

---

## Hardness

Represents the difficulty level of the game, derived from the `HARNESS_VALUES` constant array.

**What it’s for**

- Standardizes difficulty values across:
  - game settings
  - AI / backend requests
  - saved game metadata

**How it looks (shape)**

- `(typeof HARNESS_VALUES)[number]`

**File:** [hardness.type.ts](../../src/app/utils/types/hardness.type.ts)

---

## savedGameStatus

Union type describing valid status values of a saved game.
Derived from the `SAVED_GAME_STATUSES` constant array.

**What it’s for**

- Keeps saved game lifecycle/status values centralized and type-safe.
- Prevents invalid status assignments.

**How it looks (shape)**

- `(typeof SAVED_GAME_STATUSES)[number]`

**File:** [game-status.type.ts](../../src/app/utils/types/game-status.type.ts)
