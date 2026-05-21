import { Component, Input } from '@angular/core';
import { formatDate } from '../../services/api.service';

export interface Medication {
  name: string;
  dose?: string;
  frequency?: string;
  status?: string;
}

@Component({
  selector: 'app-medication-list',
  standalone: true,
  template: `
    <div>
      @if (!medications || medications.length === 0) {
        <div class="text-sm text-gray-500">No active medications</div>
      } @else {
        <ul class="space-y-2">
          @for (m of medications; track m.name) {
            <li class="card">
              <div class="flex justify-between">
                <div>
                  <p class="font-semibold">{{ m.name }}</p>
                  <p class="text-xs text-gray-500">{{ m.dose }} • {{ m.frequency }}</p>
                </div>
                <div class="text-xs text-gray-400">{{ m.status || '' }}</div>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class MedicationListComponent {
  @Input() medications: Medication[] = [];
}
