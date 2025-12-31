## FormTemplate Service (Reactive Form Configuration)

The `FormTemplate` service provides **strongly-typed, reusable form templates** for multiple dialog-driven forms in the application (game settings, save game, login/registration, account changes, and theme settings).

Instead of building form configs inside components, this service centralizes the **field definitions**, **dialog buttons**, and **titles**, and keeps certain fields **reactive** by deriving their default values from **NgRx store selectors** and the current authentication state.

### Core idea

- Form templates are represented as:
  - `structure: FormField[]` → the fields to render
  - `buttons: DialogStructure['buttons']` → the dialog actions
  - `title: string` → dialog title
- Some templates are **reactive** using `computed(...)`:
  - e.g. game settings automatically reflect the latest values from the NgRx store
  - some options depend on whether the user is logged in (via `Auth.user()`)
- Templates are stored in a computed `Map<FieldKey, Template>` so they can be fetched by a single key.

---

## Public API (detailed)

### `formFieldMap: Map<FieldKey, { structure: FormField[]; buttons: DialogStructure['buttons']; title: string }>`

Returns the current mapping between a form key (`FieldKey`) and its template.

**Behavior**

- The map is created via `computed(...)` to ensure reactive templates (like game settings) are always up to date.
- Keys included (as currently defined):
  - `game_setting`
  - `save`
  - `setting`
  - `login`
  - `registration`
  - `email_change`
  - `password_change`

**Typical use case**

- Used by dialog components/services to render the correct form based on a key.

---

### `getButtonsByFieldKey(fieldKey: FieldKey): DialogStructure['buttons']`

Returns the button configuration for the given form key.

**Behavior**

- Looks up the key in `formFieldMap`.
- Returns the `buttons` array that defines dialog actions (e.g. `trigger`, `accept`, `reject`) and their trigger values.

**Typical use case**

- Render footer buttons dynamically for a dialog form.

---

### `getStructureByFieldKey(fieldKey: FieldKey): FormField[]`

Returns the form field structure (array of `FormField`) for the given form key.

**Behavior**

- Looks up the key in `formFieldMap`.
- Returns a `FormField[]` describing each input (type, model, validation keys, options, etc.).

**Typical use case**

- Generate a form UI dynamically from template definitions.

---

### `getTitleByFieldKey(fieldKey: FieldKey): string`

Returns the title string for the given form key.

**Behavior**

- Looks up the key in `formFieldMap`.
- Returns the template’s `title`.

**Typical use case**

- Display dialog title for the selected form.

---

## Template definitions (what this service provides)

### Game settings (`game_setting`) _(reactive)_

A computed template that stays in sync with NgRx + auth state.

**Fields**

- `size` (select): board size options `[3..9]`
  - `baseValue` from store selector: `selectGameSize`
- `opponent` (select): opponent type
  - options depend on authentication:
    - logged in → `['computer', 'player']`
    - logged out → `['player']`
  - `baseValue` from store selector `selectGameOpponent` (fallback `'player'`)
- `hardness` (range): difficulty slider
  - `min: 1`, `max: HARNESS_VALUES.length`
  - `baseValue` from store selector: `selectGameHardness`

**Buttons**

- `Accept` → `triggerValue: 'form'`
- `Reject`

---

### Save game (`save`)

A static template for naming a saved match.

**Fields**

- `gameName` (text)
  - validation via `errorKeys: ['required']`

**Buttons**

- `Save` → `triggerValue: 'form'`
- `Cancel`

---

### Theme settings (`setting`)

A static template for selecting UI colors.

**Fields**

- `primaryColor` (color)
- `accentColor` (color)

**Buttons**

- `Apply` → `triggerValue: 'form'`
- `Cancel` → `triggerValue: 'reset'`

---

### Login (`login`)

Login form template.

**Fields**

- `email` (email)
  - `errorKeys`: `required`, `invalidEmail`, `emailDoesNotExist`
- `password` (password)
  - `errorKeys`: `required`, `shortPassword`, `longPassword`

**Buttons**

- `Login` → `triggerValue: 'form'`
- `Registration` → `triggerValue: 'change:registration'`
- `Cancel`

---

### Registration (`registration`)

Registration form template.

**Fields**

- `email` (email)
  - `errorKeys`: `required`, `invalidEmail`, `emailInUse`
- `password` (password)
  - `errorKeys`: `required`, `shortPassword`, `longPassword`
- `rePassword` (password confirmation)
  - `errorKeys`: `required`, `shortPassword`, `longPassword`

**Buttons**

- `Register` → `triggerValue: 'form'`
- `Login` → `triggerValue: 'change:login'`
- `Cancel`

---

### Email change (`email_change`)

Template for changing the user’s email.

**Fields**

- `email` (old email)
  - `errorKeys`: `required`, `invalidEmail`, `notCurrentUserEmail`
- `newEmail` (new email)
  - `errorKeys`: `required`, `invalidEmail`, `emailInUse`

**Buttons**

- `Change` → `triggerValue: 'form'`
- `Back`

---

### Password change (`password_change`)

Template for changing the user’s password.

**Fields**

- `password` (old password)
  - `errorKeys`: `required`, `shortPassword`, `notCurrentUserPassword`
- `newPassword` (new password)
  - `errorKeys`: `required`, `shortPassword`
- `rePassword` (confirm new password)
  - `errorKeys`: `required`, `shortPassword`

**Buttons**

- `Change` → `triggerValue: 'form'`
- `Back`
