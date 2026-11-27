import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  isScrolled = signal<boolean>(false);
  scrollProgress = signal<number>(0);
  isMenuOpen = signal<boolean>(false);

  private removeScrollListener?: () => void;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
            const progress = Math.min(Math.max(scrollY / 140, 0), 1);
            const scrolled = scrollY > 40;

            if (this.scrollProgress() !== progress || this.isScrolled() !== scrolled) {
              this.ngZone.run(() => {
                this.scrollProgress.set(progress);
                this.isScrolled.set(scrolled);
              });
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      this.removeScrollListener = () => window.removeEventListener('scroll', onScroll);
    });
  }

  ngOnDestroy(): void {
    this.removeScrollListener?.();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
