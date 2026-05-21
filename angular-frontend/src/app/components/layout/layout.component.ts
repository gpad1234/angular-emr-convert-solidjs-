import { Component, Input } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white/90 border-b border-gray-200 z-40">
        <div class="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div class="w-10"></div>
          <h1 class="text-base font-semibold text-gray-800 tracking-tight">{{ title || 'Diabetes EMR' }}</h1>
          <div class="w-10"></div>
        </div>
      </header>
      <main class="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <ng-content />
      </main>
      <app-navbar />
    </div>
  `,
})
export class LayoutComponent {
  @Input() title = '';
}
