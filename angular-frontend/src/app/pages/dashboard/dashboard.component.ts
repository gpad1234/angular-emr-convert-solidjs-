import { Component, computed, ChangeDetectionStrategy } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LayoutComponent } from '../../components/layout/layout.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [LayoutComponent, StatCardComponent],
  template: `
    <app-layout title="Dashboard">

      @if (stats.isLoading()) {
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
          </div>
        </div>
      }

      @if (stats.error()) {
        <div class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p class="text-red-700 font-semibold text-sm">Failed to load dashboard</p>
          <p class="text-red-500 text-xs mt-1">Ensure the backend is running on port 8000</p>
        </div>
      }

      @if (stats.value(); as s) {
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <app-stat-card label="Total Patients" [value]="s.total_patients" icon="👥" to="/patients" />
            <app-stat-card label="Avg HbA1c (30d)" [value]="avgHbA1c()" icon="🩺" />
            <app-stat-card label="HbA1c > 9%" [value]="s.high_hba1c_count" icon="📈" />
            <app-stat-card label="Active Meds" [value]="s.active_medications_count" icon="💊" />
          </div>
        </div>
      }

    </app-layout>
  `,
})
export class DashboardComponent {
  stats = httpResource<any>(() => '/api/v1/stats/dashboard');

  avgHbA1c = computed(() => {
    const value = this.stats.value()?.avg_hba1c_last_30_days;
    return value == null ? 'N/A' : `${value.toFixed(1)}%`;
  });
}
