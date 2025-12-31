# Interfaces

This page provides an overview of the shared **TypeScript interfaces** used across the application.
Each section explains what the interface is used for, and includes a link to the source file.

## Table of contents

- [AiMove](#aimove)
- [CellCoordinate](#cellcoordinate)
- [DialogStructure](#dialogstructure)
- [DialogTriggerButton](#dialogtriggerbutton)
- [FormField](#formfield)
- [GameInfo](#gameinfo)
- [GameSettings](#gamesettings)
- [LastMove](#lastmove)
- [retryConfig](#retryconfig)
- [SavedGame](#savedgame)
- [snackbarTemplate](#snackbartemplate)
- [User](#user)

---

## AiMove

Represents the backend response for an AI move.
This interface is used when the frontend requests the AI to make a move, and receives the updated board + metadata.

**Key fields**

- `winner`: `'x' | 'o' | 'draw' | null` (winner after the move, or `null` if ongoing)
- `region`: `{ startRow, endRow, startColumn, endColumn } | null` (evaluated/affected region)
- `lastMove`: `{ row, column }` (AI’s last move coordinates)
- `board`: `string[][]` (board state after the AI move)

**File:** [ai-move.interface.ts](../../src/app/utils/interfaces/ai-move.interface.ts)

---

## CellCoordinate

Represents a single cell coordinate on the board.
Used anywhere the app needs to reference a specific position.

**Key fields**

- `xCoordinate`: `number`
- `yCoordinate`: `number`

**File:** [celll-coordinate.interface.ts](../../src/app/utils/interfaces/celll-coordinate.interface.ts)

---

## DialogStructure

Defines the structure of a dialog instance (title, content, optional buttons).
Used by dialog-related UI logic to render dialogs in a consistent way.

**Key fields**

- `title`: `string`
- `content`: `string`
- `buttons?`: array of button configs:
  - `button`: `DialogButton`
  - `name`: `string`
  - `triggerValue?`: `string`

**File:** [dialog-structure.interface.ts](../../src/app/utils/interfaces/dialog-structure.interface.ts)

---

## DialogTriggerButton

Represents a button configuration that triggers opening a dialog.
Useful for building “toolbar / icon button” style dialog openers in a reusable way.

**Key fields**

- `ariaLabel`: `string` (accessibility label)
- `iconPath`: `string` (icon source/path)
- `action`: `() => void` (callback executed on click)
- `condition`: `boolean` (visibility/availability condition)

**File:** [dialog-trigger-button.interface.ts](../../src/app/utils/interfaces/dialog-trigger-button.interface.ts)

---

## FormField

Defines the structure of a single form field used in dialog-driven forms (login, settings, save-game, etc.).
This supports dynamic form rendering from metadata.

**Key fields**

- `key`: `string` (UI identifier)
- `title`: `string` (label)
- `type`: `'select' | 'text' | 'email' | 'range' | 'color' | 'password'`
- `model`: `FormFieldModel` (binding key)
- `options?`: `string[] | number[]` (for selects)
- `baseValue?`: `string | number` (default value)
- `min?` / `max?`: `number` (for range inputs)
- `errorKeys?`: `ErrorKeys[]` (validation keys to check)
- `valueType`: `'string' | 'number'` (expected output type)

**File:** [form-field-template.interface.ts](../../src/app/utils/interfaces/form-field-template.interface.ts)

---

## GameInfo

Represents the **runtime state** of the current game session, including progress data and cumulative statistics.
All fields are optional to allow partial updates and flexible patching.

**Key fields**

- `results?`: aggregated counters (wins/losses/draws) for `x` and `o`
- `actualMarkup?`: `'x' | 'o'` (whose turn)
- `actualStep?`: `number` (move index)
- `started?`: `boolean` (game started flag)
- `actualBoard?`: `string[][]` (current board)
- `lastMove?`: `LastMove` (last played move)
- `playerSpentTime?`: time spent per player (`player_X?`, `player_O?`)
- `winner?`: `'x' | 'o' | 'draw' | null`
- `loadedGameName?`: `string` (name of loaded session, if any)

**File:** [game-info.interface.ts](../../src/app/utils/interfaces/game-info.interface.ts)

---

## GameSettings

Represents the configuration used to initialize a new game.

**Key fields**

- `size`: `number` (board size, e.g. 3 => 3x3)
- `opponent`: `'player' | 'computer'`
- `hardness`: `number` (numeric difficulty level)

**File:** [game-settings.interface.ts](../../src/app/utils/interfaces/game-settings.interface.ts)

---

## LastMove

Represents the coordinates of the most recently played move on the board.
Used by game logic (and AI integration) to provide context about the previous step.

**Key fields**

- `row`: `number`
- `column`: `number`

**Usage example**

- Stored in `GameInfo.lastMove`
- Sent to the backend when requesting an AI move

**File:** [last-move.type.ts](../../src/app/utils/interfaces/last-move.type.ts)

---

## retryConfig

Configuration object for controlling retry behavior of HTTP requests.
Used by the `Http` service to define retry count and initial delay.

**Key fields**

- `maxRetries?`: `number` (default handled by `Http`)
- `initialDelay?`: `number` in ms (default handled by `Http`)

**File:** [retry-config.interface.ts](../../src/app/utils/interfaces/retry-config.interface.ts)

---

## SavedGame

Represents a persisted game session, including board state, last move, status, ownership, and settings-related metadata.
Used for save/load features.

**Key fields**

- `gameId`: `string`
- `name`: `string`
- `board`: `any[][]` (stored board state)
- `lastMove`: `{ row, column } | undefined`
- `status`: `savedGameStatus`
- `userId`: `string`
- `difficulty`: `Hardness`
- `size`: `number`
- `opponent`: `GameSettings['opponent']`
- `updatedAt`: `string`
- `createdAt`: `string`

**File:** [saved-game.interface.ts](../../src/app/utils/interfaces/saved-game.interface.ts)

---

## snackbarTemplate

Describes a snackbar message item stored and rendered by the snackbar system.

**Key fields**

- `id`: `number` (unique identifier)
- `content`: `string` (message text)
- `duration`: `number` (lifetime in ticks)
- `error`: `boolean` (error styling flag)

**File:** [snackbar.interface.ts](../../src/app/utils/interfaces/snackbar.interface.ts)

---

## User

Represents a user entity as returned by the backend API.
It contains authentication-related identity data and aggregated game statistics.

**Key fields**

- `userId`: `string`  
  Unique identifier for the user.
- `email`: `string`  
  Email address used for login.
- `winNumber`: `number`  
  Total number of games the user has won.
- `loseNumber`: `number`  
  Total number of games the user has lost.
- `game_count`: `number`  
  Number of games saved by the user.

**Typical usage**

- Stored as the current user in `Auth.user` (signal state).
- Used to display profile/account statistics.
- Used to associate saved games with a specific user account.

**File:** [user.interface.ts](../../src/app/utils/interfaces/user.interface.ts)
