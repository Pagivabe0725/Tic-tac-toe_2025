import {
  DOCUMENT,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

/**
 * @service Theme
 *
 * Manages the global visual theme of the application, including:
 * - Color scheme (`light` / `dark`)
 * - Primary and accent colors (synced to CSS variables + localStorage)
 * - Viewport size tracking (width/height in pixels)
 *
 * Note:
 * - This service currently stores the viewport width as a **pixel value**,
 *   not as a breakpoint label (e.g. `md`, `xl`).
 * - Theme values are persisted in `localStorage` and applied to the document body.
 */
@Injectable({
  providedIn: 'root',
})
export class Theme {
  /** Reference to the global `document` object. */
  #document = inject(DOCUMENT);

  /** Reactive signal storing the primary color of the theme. */
  #primaryColor: WritableSignal<string | undefined> = signal(undefined);

  /** Reactive signal storing the accent color of the theme. */
  #accentColor: WritableSignal<string | undefined> = signal(undefined);

  /** Reactive signal tracking the current color scheme (`light` or `dark`). */
  #mode: WritableSignal<'light' | 'dark' | undefined> = signal(undefined);

  /** Reactive signal storing the current viewport width (in px). */
  #width: WritableSignal<number | undefined> = signal(undefined);

  /** Reactive signal storing the current viewport height (in px). */
  #height: WritableSignal<number | undefined> = signal(undefined);

  /**
   * Read-only access to the current viewport width in pixels.
   */
  get width(): Signal<number | undefined> {
    return this.#width;
  }

  /**
   * Updates the stored viewport width in pixels.
   *
   * Typically set by the resize handler.
   */
  set width(newWidth: number | undefined) {
    this.#width.set(newWidth);
  }

  /**
   * Returns the current viewport height in pixels.
   */
  get height(): number | undefined {
    return this.#height();
  }

  /**
   * Updates the stored viewport height in pixels.
   *
   * Typically set by the resize handler.
   */
  set height(newHeight: number | undefined) {
    this.#height.set(newHeight);
  }

  /**
   * Returns the current color scheme (`light` or `dark`).
   */
  get mode(): 'light' | 'dark' | undefined {
    return this.#mode();
  }

  /**
   * Sets the current color scheme (`light` or `dark`).
   *
   * An effect will also persist the value to `localStorage`
   * and update the `color-scheme` CSS property.
   */
  set mode(newMode: 'light' | 'dark' | undefined) {
    this.#mode.set(newMode);
  }

  /**
   * Returns the current primary color.
   *
   * This value is synced to the `--theme-primary` CSS variable via an effect.
   */
  get primaryColor(): string | undefined {
    return this.#primaryColor();
  }

  /**
   * Sets the primary color.
   *
   * An effect will apply it to `--theme-primary` and persist it in `localStorage`.
   */
  set primaryColor(newColor: string | undefined) {
    this.#primaryColor.set(newColor);
  }

  /**
   * Returns the current accent color.
   *
   * This value is synced to the `--theme-accent` CSS variable via an effect.
   */
  get accentColor(): string | undefined {
    return this.#accentColor();
  }

  /**
   * Sets the accent color.
   *
   * An effect will apply it to `--theme-accent` and persist it in `localStorage`.
   */
  set accentColor(newColor: string | undefined) {
    this.#accentColor.set(newColor);
  }

  /**
   * Exposes the current theme mode as a reactive signal.
   *
   * The value is `'light' | 'dark' | undefined`.
   * Note: the return type could be narrowed to `Signal<'light' | 'dark' | undefined>`,
   * but is kept compatible with the existing signature.
   */
  get modeSignal(): Signal<string | undefined> {
    return this.#mode;
  }

  /**
   * Initializes the service:
   * - Reads the initial viewport size (width/height in px)
   * - Registers a resize listener to keep width/height up to date
   * - Loads initial theme values from CSS variables and/or localStorage
   * - Sets up effects to keep CSS variables and localStorage in sync with signals
   */
  constructor() {
    this.width = this.#document.defaultView?.innerWidth;
    this.height = this.#document.defaultView?.innerHeight;
    this.#document.defaultView?.addEventListener('resize', this.onResize);

    this.setBasicState();

    // Sync primary color with CSS variables and localStorage.
    effect(() => {
      if (this.#primaryColor()) {
        this.#document.body.style.setProperty(
          '--theme-primary',
          this.#primaryColor()!
        );
        localStorage.setItem('--theme-primary', this.#primaryColor()!);
      }
    });

    // Sync accent color with CSS variables and localStorage.
    effect(() => {
      if (this.#accentColor()) {
        this.#document.body.style.setProperty(
          '--theme-accent',
          this.#accentColor()!
        );
        localStorage.setItem('--theme-accent', this.#accentColor()!);
      }
    });

    // Sync color scheme with CSS and localStorage.
    effect(() => {
      if (this.#mode()) {
        this.#document.body.style.setProperty('color-scheme', this.#mode()!);
        localStorage.setItem('color-scheme', this.#mode()!);
      }
    });
  }

  /**
   * Extracts the lightness (L) component from an OKLCH color string.
   * Example: `"oklch(0.75 0.1 120)"` -> `0.75`
   *
   * Important:
   * - This assumes the input is an `oklch(...)` string.
   * - If `background-color` is returned as `rgb(...)`/`rgba(...)`, this parsing will not be valid.
   *
   * @param oklch - OKLCH color string
   * @returns The numeric lightness value (0–1 range)
   */
  private getLigthnessFromOKLCH(oklch: string) {
    return parseFloat(oklch.substring(6, oklch.length - 1).split(' ')[0]);
  }

  /**
   * Window resize handler.
   *
   * Updates stored viewport size signals (width/height in pixels).
   */
  private onResize = () => {
    this.height = this.#document.defaultView?.innerHeight;
    this.width = this.#document.defaultView?.innerWidth;
  };

  /**
   * Initializes the theme's internal state from CSS variables and localStorage.
   *
   * - Reads CSS variables (`--theme-primary`, `--theme-accent`) from the document
   * - Loads saved values from `localStorage` (if available)
   * - Sets the color scheme from saved value or infers it using background lightness
   *
   * Notes:
   * - Background lightness inference assumes `background-color` is in OKLCH format.
   *   If the browser returns it in another format (e.g. rgb), the inference may be inaccurate.
   */
  private setBasicState(): void {
    const primary = getComputedStyle(this.#document.body).getPropertyValue(
      '--theme-primary'
    );
    const accent = getComputedStyle(this.#document.body).getPropertyValue(
      '--theme-accent'
    );

    const backgroundColorInOKLCH = getComputedStyle(
      this.#document.body
    ).getPropertyValue('background-color');

    const savedPrimary = localStorage.getItem('--theme-primary');
    const savedAccent = localStorage.getItem('--theme-accent');
    const savedScheme = localStorage.getItem('color-scheme') as
      | 'light'
      | 'dark'
      | undefined;

    this.#primaryColor.set(savedPrimary ?? primary);
    this.#accentColor.set(savedAccent ?? accent);

    // If no saved scheme exists, infer it from the background lightness threshold.
    this.#mode.set(
      savedScheme ??
        (this.getLigthnessFromOKLCH(backgroundColorInOKLCH) < 0.8
          ? 'dark'
          : 'light')
    );
  }
}
