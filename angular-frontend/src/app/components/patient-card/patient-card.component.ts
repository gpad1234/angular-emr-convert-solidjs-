import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Patient {
  id: number | string;
  first_name: string;
  last_name: string;
  gender?: string;
  age?: number;
  latest_hba1c?: { value_percent: number } | null;
}

@Component({
  selector: 'app-patient-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/patients', patient.id]" class="block">
      <div class="card flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span class="font-bold">{{ initials }}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-800">{{ patient.first_name }} {{ patient.last_name }}</p>
              <p class="text-xs text-gray-400">{{ patient.gender }} · {{ patient.age || '' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">
                {{ patient.latest_hba1c ? patient.latest_hba1c.value_percent.toFixed(1) + '%' : '—' }}
              </p>
              <p class="text-xs text-gray-400">HbA1c</p>
            </div>
          </div>
        </div>
      </div>
    </a>
  `,
})
export class PatientCardComponent {
  @Input({ required: true }) patient!: Patient;

  get initials(): string {
    return `${this.patient.first_name ? this.patient.first_name[0] : ''}${this.patient.last_name ? this.patient.last_name[0] : ''}`;
  }
}
