## GameLogic Service (Core Game Rules & AI Integration)

The `GameLogic` service encapsulates the core gameplay-related operations for the Tic-Tac-Toe application.
Its main responsibilities are requesting AI moves from the backend and checking the current board state for a winner or draw.

### Core idea

- Delegates AI calculations and board evaluation to backend endpoints.
- Uses the `Http` service as a backend request wrapper with retry strategies.
- Uses the `Functions` service to translate UI-friendly difficulty values into the backend-compatible `Hardness` representation.

---

## Public API (detailed)

### `aiMove(board: string[][], markup: 'x' | 'o', hardness: number, lastMove: LastMove): Promise<AiMove | undefined>`
Requests the backend to compute the AI’s next move.

**Behavior**
- Sends a `POST` request to `game/ai-move` with:
  - `board`: current board as a 2D string array
  - `markup`: the AI symbol (`'x'` or `'o'`)
  - `hardness`: converted from a numeric value to a `Hardness` string using `Functions.numberToDifficulty(hardness)`
  - `lastMove`: last move metadata (`LastMove`)
- Uses retry settings:
  - `maxRetries: 5`
  - `initialDelay: 700`
- Returns:
  - an `AiMove` object on success
  - `undefined` if the backend fails or no move can be computed

**Typical use case**
- Called after the player finishes a move when the opponent type is set to “computer”.

**Important note**
- Even though the method receives `hardness` as a number (e.g. from a slider), the backend receives the string-based difficulty (e.g. `'easy'`, `'hard'`), ensuring a consistent API contract.

---

### `hasWinner(board: string[][]): Promise<{ winner: 'draw' | 'x' | 'o' | null } | undefined>`
Checks whether the current board state has a winner, a draw, or is still in progress.

**Behavior**
- Sends a `POST` request to `game/check-board` with:
  - `board`: current board as a 2D string array
- Uses retry settings:
  - `maxRetries: 3`
  - `initialDelay: 200`
- Returns an object containing:
  - `winner: 'x' | 'o'` → a player has won
  - `winner: 'draw'` → the board is full and no one won
  - `winner: null` → the game is still ongoing
- Returns `undefined` if the request fails.

**Typical use case**
- Called after each move to determine if the match should end or continue.
