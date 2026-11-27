import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  isVisible = signal<boolean>(true);
  isZooming = signal<boolean>(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible.set(false);
      return;
    }

    // Step 1: Hold the single centered monogram briefly
    setTimeout(() => {
      this.isZooming.set(true);
    }, 700);

    // Step 2: Conclude camera zoom and unveil website smoothly
    setTimeout(() => {
      this.isVisible.set(false);
      document.documentElement.setAttribute('data-loaded', 'true');
    }, 1500);
  }
}
