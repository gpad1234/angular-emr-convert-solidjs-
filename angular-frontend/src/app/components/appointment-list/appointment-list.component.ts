import { Component, Input } from '@angular/core';
import { formatDate } from '../../services/api.service';

export interface Appointment {
  title?: string;
  type?: string;
  start_datetime?: string;
  location?: string;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  template: `
    <div>
      @if (!appointments || appointments.length === 0) {
        <div class="text-sm text-gray-500">No upcoming appointments</div>
      } @else {
        <ul class="space-y-2">
          @for (a of appointments; track a.start_datetime) {
            <li class="card">
              <div class="flex justify-between">
                <div>
                  <p class="font-semibold">{{ a.title || a.type || 'Appointment' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(a.start_datetime) }}</p>
                </div>
                <div class="text-xs text-gray-400">{{ a.location || '' }}</div>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AppointmentListComponent {
  @Input() appointments: Appointment[] = [];
  readonly formatDate = formatDate;
}
