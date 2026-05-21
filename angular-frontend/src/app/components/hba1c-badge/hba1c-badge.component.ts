import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hba1c-badge',
  standalone: true,
  template: `
    <div>
      <div [class]="'inline-flex items-center justify-center rounded-full px-3 py-1 ' + colorClass">
        <span class="font-semibold">{{ value != null ? value.toFixed(1) : '—' }}%</span>
      </div>
    </div>
  `,
})
export class HbA1cBadgeComponent {
  @Input() value: number | null | undefined = null;
  @Input() size: 'sm' | 'lg' = 'sm';

  get colorClass(): string {
    if (this.value == null) return 'bg-gray-100 text-gray-500';
    if (this.value < 7) return 'bg-green-100 text-green-800';
    if (this.value < 8.5) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  }
}
