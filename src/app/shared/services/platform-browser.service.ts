import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlatformBrowserService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getDocument(): Document | null {
    return this.isBrowser ? this.document : null;
  }

  getWindow(): Window | null {
    return this.isBrowser ? window : null;
  }

  getNavigator(): Navigator | null {
    return this.isBrowser ? navigator : null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  removeItem(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }
}
