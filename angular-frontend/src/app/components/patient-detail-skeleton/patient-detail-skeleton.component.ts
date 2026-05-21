import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-detail-skeleton',
  standalone: true,
  template: `
    <div class="space-y-4 animate-pulse">
      <div class="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-4 pb-6">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-white/20"></div>
          <div class="space-y-2">
            <div class="h-4 bg-white/30 rounded w-32"></div>
            <div class="h-3 bg-white/20 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div class="px-4 space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="card h-16 bg-gray-100"></div>
          <div class="card h-16 bg-gray-100"></div>
        </div>
        <div class="card h-20 bg-gray-100"></div>
        <div class="card h-20 bg-gray-100"></div>
      </div>
    </div>
  `,
})
export class PatientDetailSkeletonComponent {}
