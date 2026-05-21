import { Component, signal, computed, effect, inject, untracked, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LayoutComponent } from '../../components/layout/layout.component';
import { PatientDetailSkeletonComponent } from '../../components/patient-detail-skeleton/patient-detail-skeleton.component';
import { MedicationListComponent } from '../../components/medication-list/medication-list.component';
import { AppointmentListComponent } from '../../components/appointment-list/appointment-list.component';
import { LoadMoreButtonComponent } from '../../components/load-more-button/load-more-button.component';
import { GlucoseChartComponent } from '../../components/glucose-chart/glucose-chart.component';
import { HbA1cBadgeComponent } from '../../components/hba1c-badge/hba1c-badge.component';
import { classifyGlucose, formatDateTime, calculateAge } from '../../services/api.service';

@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LayoutComponent,
    PatientDetailSkeletonComponent,
    MedicationListComponent,
    AppointmentListComponent,
    LoadMoreButtonComponent,
    GlucoseChartComponent,
    HbA1cBadgeComponent,
    DecimalPipe,
  ],
  template: `
    <app-layout [title]="patientTitle()">

      @if (loading() || !id()) {
        <div class="p-4">
          <app-patient-detail-skeleton />
        </div>
      }

      @if (!loading() && error()) {
        <div class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p class="text-red-700 font-semibold">Patient not found</p>
          <p class="text-red-500 text-sm mt-1">Patient #{{ id() }} could not be loaded.</p>
        </div>
      }

      @if (!loading() && !error() && summary()) {
        <div class="space-y-4 pb-4">

          <!-- Header banner -->
          <div class="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-4 pb-6">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-lg">{{ initials() }}</span>
              </div>
              <div>
                <h1 class="text-white font-bold text-lg leading-tight">
                  {{ summary()!.patient.first_name }} {{ summary()!.patient.last_name }}
                </h1>
                <p class="text-primary-100 text-sm">
                  {{ age() }} yrs · {{ summary()!.patient.gender }}
                  {{ summary()!.patient.bmi ? '· BMI ' + summary()!.patient.bmi : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Latest readings -->
          <section class="px-4">
            <h2 class="section-title mb-3">Latest Readings</h2>
            <div class="grid grid-cols-2 gap-3">
              <div class="card text-center">
                <p class="text-xs text-gray-500 mb-1">HbA1c</p>
                @if (summary()!.latest_hba1c) {
                  <app-hba1c-badge [value]="summary()!.latest_hba1c.value_percent" size="lg" />
                } @else {
                  <span class="text-gray-300 text-lg">—</span>
                }
              </div>
              <div class="card text-center">
                <p class="text-xs text-gray-500 mb-1">Glucose</p>
                @if (summary()!.latest_glucose) {
                  <span class="stat-number">
                    {{ summary()!.latest_glucose.value_mgdl | number:'1.0-0' }}
                    <span class="text-xs text-gray-400 ml-0.5">mg/dL</span>
                  </span>
                } @else {
                  <span class="text-gray-300 text-lg">—</span>
                }
              </div>
            </div>
          </section>

          <!-- Medications -->
          <section class="px-4">
            <h2 class="section-title mb-3">Active Medications</h2>
            <app-medication-list [medications]="summary()!.active_medications || []" />
          </section>

          <!-- Appointments -->
          <section class="px-4">
            <h2 class="section-title mb-3">Upcoming Appointments</h2>
            <app-appointment-list [appointments]="summary()!.upcoming_appointments || []" />
          </section>

          <!-- Glucose history -->
          <section class="px-4">
            <h2 class="section-title mb-3">Glucose History</h2>
            @if (glucoseReadings().length > 0) {
              <div class="card mb-3 overflow-hidden">
                <p class="text-xs text-gray-400 mb-2">Last {{ glucoseReadings().length }} readings</p>
                <app-glucose-chart [readings]="glucoseReadings()" />
              </div>
            }

            <div class="space-y-2">
              @for (r of glucoseReadings(); track r.reading_datetime) {
                <div class="card flex items-center justify-between py-2.5">
                  <div>
                    <p class="text-sm text-gray-700">{{ r.reading_type }}</p>
                    <p class="text-xs text-gray-400">{{ formatDateTime(r.reading_datetime) }}</p>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-lg" [style.color]="classifyGlucose(r.value_mgdl).color">
                      {{ r.value_mgdl | number:'1.0-0' }}
                    </span>
                    <span class="text-xs text-gray-400 ml-0.5">mg/dL</span>
                    <p class="text-xs" [style.color]="classifyGlucose(r.value_mgdl).color">
                      {{ classifyGlucose(r.value_mgdl).label }}
                    </p>
                  </div>
                </div>
              }
            </div>

            <app-load-more-button
              [isLoading]="glucoseLoading()"
              [hasMore]="glucoseHasMore()"
              label="Load More Readings"
              (clicked)="fetchGlucose(glucoseSkip())"
            />
          </section>

        </div>
      }

    </app-layout>
  `,
})
export class PatientDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  id = toSignal(this.route.paramMap.pipe(map(p => p.get('id') ?? '')), { initialValue: '' });

  summary = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  glucoseReadings = signal<any[]>([]);
  glucoseSkip = signal(0);
  glucoseHasMore = signal(false);
  glucoseLoading = signal(false);

  readonly classifyGlucose = classifyGlucose;
  readonly formatDateTime = formatDateTime;

  patientTitle = computed(() => {
    const p = this.summary()?.patient;
    return p ? `${p.first_name} ${p.last_name}` : 'Patient';
  });

  initials = computed(() => {
    const p = this.summary()?.patient;
    return p ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}` : '';
  });

  age = computed(() => {
    const dob = this.summary()?.patient?.date_of_birth;
    return dob ? calculateAge(dob) : '';
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      // Reset and load when id changes
      this.loading.set(true);
      this.summary.set(null);
      this.error.set(null);
      this.glucoseReadings.set([]);
      this.glucoseSkip.set(0);
      this.glucoseHasMore.set(false);
      untracked(() => this.loadSummary(id));
    }, { allowSignalWrites: true });
  }

  private loadSummary(id: string): void {
    this.http.get<any>(`/api/v1/patients/${id}/summary`).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
        this.fetchGlucose(0);
      },
      error: (err) => {
        this.error.set(err.message || String(err));
        this.loading.set(false);
      },
    });
  }

  fetchGlucose(currentSkip: number): void {
    this.glucoseLoading.set(true);
    const params = new URLSearchParams({ skip: String(currentSkip), limit: '20' });
    this.http.get<any>(`/api/v1/patients/${this.id()}/glucose?${params}`).subscribe({
      next: (data) => {
        const readings: any[] = data.readings ?? data;
        this.glucoseReadings.update(c => currentSkip === 0 ? readings : [...c, ...readings]);
        this.glucoseHasMore.set(data.has_more ?? false);
        this.glucoseSkip.set(currentSkip + 20);
        this.glucoseLoading.set(false);
      },
      error: () => { this.glucoseLoading.set(false); },
    });
  }
}
