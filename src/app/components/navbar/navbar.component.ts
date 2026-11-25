import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = signal<boolean>(false);
  scrollProgress = signal<number>(0);
  isMenuOpen = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    // Normalized progress from 0 (top) to 1 (scrolled 120px+)
    const progress = Math.min(Math.max(scrollY / 140, 0), 1);
    this.scrollProgress.set(progress);
    this.isScrolled.set(scrollY > 40);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
