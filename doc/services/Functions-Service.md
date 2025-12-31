## Functions Service (Utility Helpers)

The `Functions` service is a small utility layer that groups commonly used helper functions.
It provides reusable methods for object shaping (DTO building), difficulty conversions, typed form model creation, safe type conversion, and simple game-related helpers.

### Core idea

- Keeps frequently used logic in one place to avoid duplication across components/services.
- Provides **type-safe helpers** for form handling and data transformation.
- Includes **domain helpers** for game difficulty and turn markup.

---

## Public API (detailed)

### `pick<T>(object: any, keys: (keyof T)[]): T`

Creates a new object by selecting a specific set of keys from a source object.

**Behavior**

- Iterates through the provided `keys`.
- Copies only properties that are not `undefined`.
- Returns a new object typed as `T`.

**Typical use cases**

- Building DTOs for API requests (send only allowed fields).
- Filtering out sensitive/irrelevant properties.
- Extracting a subset of a larger object for state updates.

---

### `numberToDifficulty(value: number): Hardness`

Converts a numeric difficulty level to a `Hardness` string literal.

**Behavior**

- Maps:
  - `1` → `'very_easy'`
  - `2` → `'easy'`
  - `3` → `'medium'`
  - `4` → `'hard'`
- For unknown values, returns `'very_easy'` as a fallback.

**Typical use case**

- Converting slider/range input values into the difficulty enum used by the game logic.

---

### `difficultyToNumber(difficulty: Hardness): number`

Converts a `Hardness` difficulty string into its numeric representation.

**Behavior**

- Maps:
  - `'very_easy'` → `1`
  - `'easy'` → `2`
  - `'medium'` → `3`
  - `'hard'` → `4`
- For unknown values, returns `1` as a safe fallback.

**Typical use case**

- Converting persisted difficulty values back to UI-friendly numeric form (e.g. range inputs).

---

### `specificFieldTypeByName<T extends Record<string, string | number>>(fieldKey: FieldKey, formFields: FormField[]): T`

Creates a strongly-typed form model object from an array of `FormField` definitions.

**Behavior**

- Iterates through `formFields` and creates an object using each field’s `model` key.
- If the field has a `baseValue`, it uses that as the initial value.
- If no `baseValue` exists, it initializes the model value as `undefined`.
- Returns the result typed as `T`.

**Important note**

- The `fieldKey` parameter is currently not used in the function body, but it can be useful as a semantic identifier (e.g. for logging, debugging, or future branching).

**Typical use cases**

- Creating default form models for dialogs.
- Producing a typed “initial value” object for reactive forms.
- Ensuring emitted form results match an expected model shape.

---

### `convertType(value: unknown, targetType: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]'): unknown`

Converts raw form inputs into a consistent, strongly-typed representation.

**Behavior**

- If `value` is `null` or `undefined`, it returns it as-is.
- If the value already matches the target type, it returns it unchanged.
- Conversion rules:
  - `'string'` → `String(value)`
  - `'number'` → `Number(value)` (keeps original value if `NaN`)
  - `'boolean'` → supports:
    - boolean input (returns as-is)
    - string input (`"true"` → `true`, otherwise `false`)
    - fallback: `Boolean(value)`
  - `'string[]'` → ensures an array of strings
  - `'number[]'` → ensures an array of numbers (keeps original element if it cannot be converted)

**Typical use cases**

- Normalizing data from form controls (select/range/text) before dispatching actions or sending API requests.
- Avoiding runtime type mismatches due to HTML inputs emitting strings.

---

### `markupByStep(step: number): 'o' | 'x'`

Determines which player mark should be used based on the current step number.

**Behavior**

- Even step (`step % 2 === 0`) → `'o'`
- Odd step → `'x'`

**Typical use case**

- Determining whose turn it is during gameplay based on the move count.
