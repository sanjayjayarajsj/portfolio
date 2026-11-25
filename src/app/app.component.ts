import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  projects = [
    {
      title: 'Silko',
      category: 'E-Commerce Platform',
      description: 'Modern luxury e-commerce web application featuring real-time checkout, robust catalog search, responsive UI, and secure transactional workflows.',
      year: '2026',
      role: 'Full Stack Developer',
      image: 'project-silko.jpg',
      url: 'https://silko-ecommerce-final.vercel.app/',
      tags: ['Angular', 'ASP.NET Core', 'Clean Architecture', 'Azure', 'SQL Server']
    },
    {
      title: 'Stag',
      category: 'Drinks & Lifestyle Web App',
      description: 'Custom brand experience and interactive product showcase with fluid motion, dynamic animations, and fast-loading media delivery.',
      year: '2025',
      role: 'Full Stack Developer',
      image: 'project-stag.jpg',
      url: 'https://stagg-store.vercel.app/',
      tags: ['C#', 'REST APIs', 'SQL Server', 'AWS', 'Tailwind CSS']
    }
  ];

  skillCategories = [
    {
      index: '01',
      title: 'Back End & Clean Architecture',
      description: 'Domain-driven design, enterprise layered architecture, and scalable REST services.',
      tags: ['C#', 'ASP.NET Core', 'Clean Architecture', 'REST APIs', 'EF Core', 'Dapper', 'Microservices']
    },
    {
      index: '02',
      title: 'Front End & Client Engineering',
      description: 'Fluid, accessible interfaces built with modern reactive state, type safety, and animations.',
      tags: ['Angular 18', 'TypeScript', 'Tailwind CSS', 'Modern CSS/SCSS', 'HTML5 & Canvas', 'Responsive UI']
    },
    {
      index: '03',
      title: 'Cloud, Infrastructure & DevOps',
      description: 'Automated CI/CD pipelines, containerization, and reliable production releases.',
      tags: ['Azure App Services', 'AWS', 'Docker', 'CI/CD Pipelines', 'GitHub Actions', 'Git Workflow']
    },
    {
      index: '04',
      title: 'Database Architecture & Performance',
      description: 'High-throughput relational databases, indexing, and performant query structures.',
      tags: ['Microsoft SQL Server', 'Relational Schemas', 'Query Tuning', 'Transaction Handling']
    }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Scroll reveal observer
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
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Observe all scroll-reveal elements
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));
  }
}
