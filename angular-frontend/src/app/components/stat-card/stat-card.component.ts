import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (to) {
      <a [routerLink]="to" class="block">
        <ng-container [ngTemplateOutlet]="inner" />
      </a>
    } @else {
      <div class="block">
        <ng-container [ngTemplateOutlet]="inner" />
      </div>
    }

    <ng-template #inner>
      <div class="card text-center cursor-pointer">
        <div class="text-2xl">{{ icon }}</div>
        <p class="stat-number mt-1 font-semibold">{{ value }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ label }}</p>
      </div>
    </ng-template>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number | null | undefined = '';
  @Input() icon = '';
  @Input() to: string | null = null;
}
