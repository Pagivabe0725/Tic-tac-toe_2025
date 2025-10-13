/*

xs	0px	Extra kicsi (mobil)
sm	640px	Kis képernyő (mobil)
md	768px	Közepes képernyő (tablet)
lg	1024px	Nagy képernyő (desktop)
xl	1280px	Extra nagy desktop
2xl	1536px	Nagyon nagy monitor

*/

import {
  DOCUMENT,
  effect,
  HostListener,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';

const BRAKE_POINTS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', undefined] as const;

type BrakePoint = (typeof BRAKE_POINTS)[number];

@Injectable({
  providedIn: 'root',
})
export class Theme {
  #document = inject(DOCUMENT);

  #primaryColor: WritableSignal<string | undefined> = signal(undefined);
  #accentColor: WritableSignal<string | undefined> = signal(undefined);
  #mode: WritableSignal<'light' | 'dark' | undefined> = signal(undefined);
  #width: WritableSignal<BrakePoint> = signal(undefined);
  #height: WritableSignal<number | undefined> = signal(undefined);

  get width(): BrakePoint {
    return this.#width();
  }
  set width(newWidth: BrakePoint) {
    this.#width.set(newWidth);
  }

  get height(): number | undefined {
    return this.#height();
  }
  set height(newHeight: number) {
    this.#height.set(newHeight);
  }

  get mode(): 'light' | 'dark' | undefined {
    return this.#mode();
  }
  set mode(newMode: 'light' | 'dark' | undefined) {
    this.#mode.set(newMode);
  }

  constructor() {
    this.#document.defaultView?.addEventListener('resize', this.onResize);

    this.setBasicState();

    effect(() => {
      if (this.#primaryColor()) {
        this.#document.body.style.setProperty(
          '--theme-primary',
          this.#primaryColor()!
        );
        localStorage.setItem('--theme-primary', this.#primaryColor()!);
      }
    });
    effect(() => {
      if (this.#accentColor()) {
        this.#document.body.style.setProperty(
          '--theme-accent',
          this.#accentColor()!
        );
        localStorage.setItem('--theme-accent', this.#accentColor()!);
      }
    });
    effect(() => {
      if (this.#mode()) {
        this.#document.body.style.setProperty('color-scheme', this.#mode()!);
        localStorage.setItem('color-scheme', this.#mode()!);
      }
    });
  }

  private getBreakPointName(size: number): string {
    if (size < 640) {
      return 'xs';
    } else if (size < 768) {
      return 'sm';
    } else if (size < 1024) {
      return 'md';
    } else if (size < 1280) {
      return 'lg';
    } else if (size < 1536) {
      return 'xl';
    } else {
      return '2xl';
    }
  }

  private getLigthnesFromOKLCH(oklch: string) {
    return parseFloat(oklch.substring(6, oklch.length - 1).split(' ')[0]);
  }

  private onResize = () => {
    console.log(this.getBreakPointName(this.#document.defaultView!.innerWidth));
  };

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
    console.log(this.getLigthnesFromOKLCH(backgroundColorInOKLCH));
    this.#mode.set(
      savedScheme ??
        (this.getLigthnesFromOKLCH(backgroundColorInOKLCH) < 0.8
          ? 'dark'
          : 'light')
    );

    console.log(this.#mode());
  }
}
