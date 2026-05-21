import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-load-more-button',
  standalone: true,
  template: `
    <div class="mt-3">
      @if (hasMore) {
        <button (click)="clicked.emit()" class="btn-primary w-full flex items-center justify-center gap-2">
          {{ isLoading ? 'Loading...' : label }}
        </button>
      }
    </div>
  `,
})
export class LoadMoreButtonComponent {
  @Input() hasMore = false;
  @Input() isLoading = false;
  @Input() label = 'Load More';
  @Output() clicked = new EventEmitter<void>();
}
