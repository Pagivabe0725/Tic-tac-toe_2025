# AI Coding Guidelines for Tic-Tac-Toe

## Project Overview

Angular 20 tic-tac-toe game with NgRx state management, session persistence, and AI opponent. The app uses **standalone components** (no NgModules), **zoneless change detection**, and **Angular Signals** for reactivity.

**Key Tech Stack:** Angular 20, NgRx, RxJS, Standalone Components, TypeScript strict mode

## Architecture Patterns

### State Management (NgRx)
- **Store Structure:** Two reducers in `src/app/store/reducers/`:
  - `gameSettingsReducer`: User preferences (difficulty, opponent type, board size)
  - `gameInfoReducer`: Runtime game state (board, results, current markup, timestamps)
  
- **State Persistence Flow:**
  1. Component dispatches action → `modifyGameInfo` or game settings action
  2. Reducer updates state
  3. Effect (in `src/app/store/effects/`) automatically persists to `sessionStorage` via `game_*` prefixed keys
  4. On app reload, reducer's `INITIAL_STATE` restores from storage using `parseFromStorage()` utility

- **Selectors:** Located in `src/app/store/selectors/`. Use descriptive names like `selectGameWinner`, `selectActualBoard`. Always create typed selectors to avoid string references.

### Component Architecture
- **Game Component** (`src/app/components/game/game.ts`): Main orchestrator
  - Subscribes to store selectors using Angular's `inject()` pattern
  - Uses `computed()` signals for derived state (click permissions, move validation)
  - Uses `effect()` for side effects (persisting results, triggering AI moves)
  - Mediates between UI and `GameLogic` service

- **Standalone Components:** All components are standalone. When creating new components, import required modules directly (no shared module declarations).

### Services
- **DialogHandler** & **SnackBarHandler**: Centralized handlers for modals and notifications. Use signals to track active content, use Subjects for data passing.
- **GameLogic**: Pure business logic. Interfaces with backend for AI moves. Methods like `aiMove()` return Promises.
- **Auth**: Persists game results (win/loss records). Manages user sessions.
- **Http**: Centralized HTTP service. Always use this instead of injecting HttpClient directly.

### Data Flow
1. **UI Event** → Component method
2. **Validation** → GameLogic service
3. **State Update** → Dispatch NgRx action
4. **Async Persistence** → Effect saves to sessionStorage or backend
5. **UI Reactive Update** → Signals/Observables notify subscribed components

## Development Workflows

### Build & Run
```bash
npm start          # Starts dev server on localhost:4200 (ng serve)
npm run build      # Production build to dist/
npm run watch      # Watch mode build (--configuration development)
npm test           # Run unit tests (Karma + Jasmine)
npm run lint       # ESLint check + fix with --fix
npm run doc        # Generate Compodoc documentation, serves on localhost:8080
npm run check      # Alias for eslint with --fix
```

### Testing
- Test files: `*.spec.ts` (co-located with source)
- Coverage reports in `coverage/` directory
- Prefer **Jasmine** syntax with `TestBed` for Angular testing
- Mock services via `provideMockProvider()` or manual stubs

### Code Generation
```bash
ng generate component components/my-component   # Generates .ts, .scss, .spec.ts files
ng generate service services/my-service         # Generates service + .spec.ts
```

## Code Style & Conventions

### TypeScript Rules (Enforced via ESLint)
- **Strict Mode:** All TypeScript code uses `strict: true`. No `any` type without explicit `@ts-ignore` (rule disabled but practice discouraged).
- **Naming:** 
  - Exported constants: `UPPER_SNAKE_CASE` (e.g., `STORAGE_PREFIX`)
  - Private fields: `#fieldName` (native TS private)
  - Functions/methods: `camelCase`
  - Components: `PascalCase` (e.g., `Game`, `GameDisplayPart`)

### File Structure
```
src/app/
├── components/      # Standalone UI components
├── services/        # Business logic, HTTP, dialogs, auth
├── store/           # NgRx state (actions, reducers, effects, selectors)
├── guards/          # Route guards (e.g., accountGuard)
├── shared/          # Interceptors, shared styles
├── utils/           # Pure functions, constants, types, interfaces
├── app.ts           # Root component
├── app.config.ts    # App configuration, providers
└── app.routes.ts    # Route definitions
```

### Styling
- **Language:** SCSS (enforced in `angular.json`)
- **Global styles:** `src/styles.scss`
- **Component styles:** Co-located `.scss` files
- **Shared variables:** Can be imported from `src/style/` if needed

### Dependency Injection
- Always use `inject()` function (modern Angular):
  ```typescript
  #store = inject(Store);
  #auth = inject(Auth);
  ```
- Never use constructor injection for new code
- Services are provided with `providedIn: 'root'` to enable tree-shaking

### Signals & Change Detection
- Use **zoneless change detection** (`provideZonelessChangeDetection()` in app.config)
- Prefer **Signals** over RxJS Observables for local component state
- Use `computed()` for derived state
- Use `effect()` for subscriptions (replaces `ngOnInit` + `subscribe()`)
- Component inputs use `input()`, outputs use `output()`

## Common Patterns

### Store Action Pattern
```typescript
// File: store/actions/game-info-modify.action.ts
export const modifyGameInfo = createAction(
  '[Game Info] Modify',
  props<Partial<GameInfo>>()
);

// Usage in component:
this.store.dispatch(modifyGameInfo({ actualMarkup: 'x', actualStep: 1 }));
```

### State Restoration Pattern
```typescript
// In reducer INITIAL_STATE:
const INITIAL_STATE: GameInfo = {
  results: parseFromStorage<GameInfo['results']>(
    `${STORAGE_PREFIX}results`,
    'sessionStorage'
  ) ?? { /* defaults */ }
};
```

### Service with Signals
```typescript
export class MyService {
  #data = signal<T[]>([]);
  readonly data = this.#data.asReadonly();
  
  updateData(newData: T[]) {
    this.#data.set(newData);
  }
}
```

### Effect for Side Effects (Persistence)
```typescript
export class MyEffect {
  private actions$ = inject(Actions);
  
  saveState$ = createEffect(
    () => this.actions$.pipe(
      ofType(myAction),
      tap(action => sessionStorage.setItem('key', JSON.stringify(action)))
    ),
    { dispatch: false }
  );
}
```

## Special Considerations

### AI Move Integration
- `GameLogic.aiMove()` calls backend to calculate AI move
- Returns `Promise<aiMove | undefined>`
- Always handle the case where no move is possible (returns `undefined`)
- Difficulty is managed in `gameSettingsReducer`

### Session Storage Prefix
- All session storage keys use `game_` prefix (constant: `STORAGE_PREFIX`)
- Makes cleanup and filtering trivial
- Use `parseFromStorage()` utility to deserialize + provide defaults

### Route Guards
- `accountGuard` protects `/account` route
- Implement guards as functions in `src/app/guards/`
- Use dependency injection via `inject()` within guard function

### Build Constraints
- Production bundle max: **500kB** (warning), **1MB** (error)
- Component styles max: **4kB** (warning), **8kB** (error)
- Monitor bundle size when adding dependencies

## When Adding New Features

1. **New Page/View:** Create standalone component in `components/`, add to `app.routes.ts`
2. **New State:** Create actions in `store/actions/`, add reducer in `store/reducers/`, create selectors in `store/selectors/`
3. **New Business Logic:** Add method to existing service or create new service in `services/` with `@Injectable({ providedIn: 'root' })`
4. **Persistence:** If state needs persistence, add effect in `store/effects/` to save to storage or backend
5. **Tests:** Always create `.spec.ts` files alongside implementation; run `npm test` to validate

## Quick Reference

| Need | Location | Example |
|------|----------|---------|
| Global state | `store/reducers/` + `store/actions/` | `game-info.reducer.ts`, `modifyGameInfo` action |
| Business logic | `services/` | `GameLogic`, `Auth` |
| UI component | `components/` | `Game`, `Header` |
| Reusable functions | `utils/functions/` | `parseFromStorage()` |
| Type definitions | `utils/interfaces/` and `utils/types/` | `GameInfo`, `LastMove` |
| Constants | `utils/constants/` | `STORAGE_PREFIX` |
| Routes | `app.routes.ts` | Game, Account (guarded) |
| Dialog/Snack | Inject `DialogHandler`, `SnackBarHandler` | Open modal or show notification |
