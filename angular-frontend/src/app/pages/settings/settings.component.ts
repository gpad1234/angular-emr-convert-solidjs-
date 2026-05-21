import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { apiBaseUrl } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout title="Settings">
      <div class="p-4 space-y-4">
        <div class="card">
          <h2 class="section-title mb-3">Application</h2>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between py-1 border-b border-gray-50">
              <span>Backend API</span>
              <span class="font-mono text-xs text-gray-400">{{ apiBaseUrl || '(same origin)' }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span>Version</span>
              <span class="text-gray-400">1.0.0 (Angular)</span>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
})
export class SettingsComponent {
  readonly apiBaseUrl = apiBaseUrl;
}
