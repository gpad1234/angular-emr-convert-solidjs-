import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        <a routerLink="/"
           routerLinkActive="text-primary-600 font-semibold"
           [routerLinkActiveOptions]="{ exact: true }"
           class="flex flex-col items-center text-sm text-gray-600"
           (click)="onNavClick('home')">
          <span>🏠</span>
          <span>Home</span>
        </a>

        <a routerLink="/patients"
           routerLinkActive="text-primary-600 font-semibold"
           class="flex flex-col items-center text-sm text-gray-600"
           (click)="onNavClick('patients')">
          <span>👤</span>
          <span>Patients</span>
        </a>

        <a routerLink="/settings"
           routerLinkActive="text-primary-600 font-semibold"
           class="flex flex-col items-center text-sm text-gray-600"
           (click)="onNavClick('settings')">
          <span>⚙️</span>
          <span>Settings</span>
        </a>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  onNavClick(target: string): void {
    try {
      window.dispatchEvent(new CustomEvent('app-refresh', { detail: { from: 'nav', target } }));
    } catch {
      // ignore non-browser contexts
    }
  }
}
