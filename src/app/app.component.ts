import { Component, AfterViewInit, OnDestroy, HostListener, signal, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderComponent } from './components/loader/loader.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroComponent, FooterComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private scrollTicking = false;

  projects = [
    {
      index: '01',
      title: 'Silko E-Commerce',
      category: 'E-Commerce',
      description: 'Modern luxury e-commerce platform with real-time checkout, robust catalog search, responsive UI, and secure transactional workflows.',
      year: '2026',
      image: '/project-silko.png',
      url: 'https://silko-ecommerce-final.vercel.app/',
      services: 'UI/UX Design · Angular 18 · ASP.NET Core · Azure',
      cardTypeClass: 'work-card--landscape',
      aspectClass: 'aspect-[16/10]',
      gridClass: 'lg:col-span-7'
    },
    {
      index: '02',
      title: 'Stag Lifestyle & Drinks',
      category: 'Drinks & Beverage',
      description: 'Interactive brand showcase and beverage web application with fluid motion, dynamic animations, and fast-loading media delivery.',
      year: '2025',
      image: '/project-stag.png',
      url: 'https://stagg-store.vercel.app/',
      services: 'UI/UX Design · Front End Development · Tailwind CSS',
      cardTypeClass: 'work-card--portrait',
      aspectClass: 'aspect-[4/5]',
      gridClass: 'lg:col-span-4 lg:col-start-9 lg:mt-40'
    },
    {
      index: '03',
      title: 'Cool-Maxx Spare Parts',
      category: 'Industrial & Spare Parts',
      description: 'AC spare parts supplier catalog and inquiry platform with real-time quote requests, product search, and responsive filtering.',
      year: '2026',
      image: '/project-coolmaxx.png',
      url: 'https://cool-maxx.vercel.app',
      services: 'AC Spare Parts Catalogue · Instant Quote & Product Enquiry',
      cardTypeClass: 'work-card--landscape',
      aspectClass: 'aspect-[16/10]',
      gridClass: 'lg:col-span-7 lg:col-start-6 lg:mt-28'
    }
  ];

  disciplines = [
    {
      index: '01',
      title: 'Back End & Architecture',
      tagline: 'Distributed services & REST APIs',
      items: ['C#', 'ASP.NET Core', 'Clean Architecture', 'REST APIs', 'EF Core', 'Dapper', 'Microservices', 'Authentication']
    },
    {
      index: '02',
      title: 'Front End Engineering',
      tagline: 'Modern reactive UI & fluid motion',
      items: ['Angular 18', 'TypeScript', 'Tailwind CSS', 'Modern SCSS', 'HTML5 Canvas', 'WebGL Shaders', 'Responsive UI', 'RxJS']
    },
    {
      index: '03',
      title: 'Cloud & Infrastructure',
      tagline: 'CI/CD pipelines & production releases',
      items: ['Microsoft Azure', 'AWS', 'Docker', 'CI/CD Pipelines', 'GitHub Actions', 'Automated Testing', 'Git Workflow']
    },
    {
      index: '04',
      title: 'Database Architecture',
      tagline: 'High-throughput SQL & query tuning',
      items: ['Microsoft SQL Server', 'Relational Schemas', 'Query Tuning', 'Transaction Handling', 'Database Indexing', 'Data Modeling']
    }
  ];

  buildItems = [
    'Presentation websites',
    'Landing pages',
    'Corporate websites',
    'E-commerce stores',
    'Personal brand sites',
    'Award-level showcases',
    'Web apps & dashboards',
    'SaaS platforms',
    'Mobile apps',
    'Enterprise REST APIs',
    'Clean Architecture .NET',
    'Custom platforms'
  ];

  stackGroups = [
    {
      title: 'Back End & Services',
      tools: ['C#', 'ASP.NET Core', 'Clean Architecture', 'Entity Framework Core', 'Dapper', 'REST APIs', 'Microservices']
    },
    {
      title: 'Front End & Client',
      tools: ['Angular 18', 'TypeScript', 'Tailwind CSS', 'HTML5 & Canvas', 'WebGL Shaders', 'Modern SCSS', 'RxJS']
    },
    {
      title: 'Cloud & DevOps',
      tools: ['Microsoft Azure', 'AWS', 'Docker', 'GitHub Actions', 'CI/CD Pipelines', 'Linux']
    },
    {
      title: 'Data & Databases',
      tools: ['Microsoft SQL Server', 'Relational Schemas', 'Query Tuning', 'Database Indexing', 'Transactions']
    }
  ];

  private cleanupObserver?: () => void;
  private cleanupCursor?: () => void;

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.scrollTicking) {
      window.requestAnimationFrame(() => {
        this.updateScrollProgress();
        this.scrollTicking = false;
      });
      this.scrollTicking = true;
    }
  }

  private updateScrollProgress(): void {
    const scrollEl = document.getElementById('scrollIndicator');
    if (!scrollEl) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    scrollEl.style.transform = `scaleX(${progress})`;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // Scroll reveal observer for editorial & skill sections
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.04,
          rootMargin: '0px 0px -20px 0px'
        }
      );

      const revealElements = document.querySelectorAll('.reveal-on-scroll');
      revealElements.forEach((el) => observer.observe(el));
      this.cleanupObserver = () => observer.disconnect();

      // Initialize Fraxbit GSAP Scroll Animations
      this.initFraxbitAnimations();

      // Floating magnetic "View" cursor
      this.initWorkCursor();

      // Refresh ScrollTrigger after initial render and image load
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });
  }

  private initFraxbitAnimations(): void {
    // 1. Stage Over: previous section container parallax push
    const stageOver = document.querySelector('[data-stage="over"]') as HTMLElement;
    if (stageOver) {
      let prev = stageOver.previousElementSibling as HTMLElement | null;
      while (prev && !prev.getClientRects().length) {
        prev = prev.previousElementSibling as HTMLElement | null;
      }
      const prevContainer = prev?.querySelector(':scope > .container') as HTMLElement | null;
      if (prevContainer) {
        gsap.fromTo(
          prevContainer,
          { y: 0, opacity: 1 },
          {
            y: () => 0.18 * window.innerHeight,
            opacity: 0.5,
            ease: 'none',
            scrollTrigger: {
              trigger: stageOver,
              start: 'top 55%',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
      }
    }

    // 2. Exact Fraxbit Clip Reveal on Images using ScrollTrigger.batch
    ScrollTrigger.batch('[data-reveal="clip"]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        const unrevealed = (batch as HTMLElement[]).filter((el) => !el.hasAttribute('data-revealed'));
        unrevealed.forEach((el) => el.setAttribute('data-revealed', ''));
        if (!unrevealed.length) return;

        gsap.fromTo(
          unrevealed,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            stagger: 0.15,
            ease: 'power4.inOut',
            overwrite: true
          }
        );

        const imgs = unrevealed.flatMap((el) => Array.from(el.querySelectorAll('.work-card__img')));
        if (imgs.length) {
          gsap.fromTo(
            imgs,
            { scale: 1.25 },
            {
              scale: 1,
              duration: 1.8,
              stagger: 0.15,
              ease: 'power3.out'
            }
          );
        }
      }
    });

    // 3. Parallax Scrub on Images (-6% to +6%)
    const parallaxElements = gsap.utils.toArray('[data-parallax="true"]') as HTMLElement[];
    parallaxElements.forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('.work-card') || el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });

    // 4. Fade & Split Reveals
    const fadeElements = gsap.utils.toArray('[data-reveal="fade"]') as HTMLElement[];
    fadeElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          }
        }
      );
    });

    const splitElements = gsap.utils.toArray('[data-reveal="split"]') as HTMLElement[];
    splitElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          }
        }
      );
    });

    // 5. Highlight Wall Scrub in Capabilities
    const highlightWall = document.querySelector('[data-highlight]') as HTMLElement;
    if (highlightWall) {
      const items = highlightWall.querySelectorAll('[data-highlight-item]');
      gsap.fromTo(
        items,
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: highlightWall,
            start: 'top 85%',
            end: 'bottom 50%',
            scrub: true
          }
        }
      );
    }
  }

  private initWorkCursor(): void {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.getElementById('workCursor');
    if (!cursor) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 1 });
    const quickX = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    const quickY = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });

    const onPointerMove = (e: MouseEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const cards = document.querySelectorAll('[data-cursor="view"]');
    const onEnter = (e: any) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      gsap.to(cursor, { scale: 1, duration: 0.45, ease: 'back.out(1.4)', overwrite: 'auto' });
    };
    const onLeave = () => {
      gsap.to(cursor, { scale: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    };

    cards.forEach((card) => {
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
    });

    this.cleanupCursor = () => {
      window.removeEventListener('pointermove', onPointerMove);
      cards.forEach((card) => {
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
      });
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }

  ngOnDestroy(): void {
    if (this.cleanupObserver) {
      this.cleanupObserver();
    }
    if (this.cleanupCursor) {
      this.cleanupCursor();
    }
  }
}
