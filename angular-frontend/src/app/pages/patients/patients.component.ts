import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { LayoutComponent } from '../../components/layout/layout.component';
import { PatientCardComponent } from '../../components/patient-card/patient-card.component';
import { LoadMoreButtonComponent } from '../../components/load-more-button/load-more-button.component';

const PAGE_SIZE = 10;
const DIABETES_TYPES = ['Type 1', 'Type 2', 'LADA', 'Gestational', 'Prediabetes', 'Other'];

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [LayoutComponent, PatientCardComponent, LoadMoreButtonComponent],
  template: `
    <app-layout title="Patients">
      <div class="p-4 space-y-3">

        <!-- Search box -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            [value]="search()"
            (input)="search.set($any($event.target).value)"
            type="search"
            placeholder="Search patients by name..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
          />
          @if (search()) {
            <button (click)="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
          }
        </div>

        <!-- Type filter -->
        <select
          [value]="typeFilter()"
          (change)="onTypeFilterChange($any($event.target).value)"
          class="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-sm"
        >
          <option value="">All Diabetes Types</option>
          @for (t of diabetesTypes; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>

        <!-- Error -->
        @if (error()) {
          <div class="p-3 bg-red-50 rounded-xl border border-red-200">
            <p class="text-red-700 text-sm">Failed to load patients: {{ error() }}</p>
          </div>
        }

        <!-- Empty state -->
        @if (!loading() && patients().length === 0 && !error()) {
          <div class="text-center py-12">
            <p class="text-gray-400 text-4xl mb-2">🔍</p>
            <p class="text-gray-500 font-medium">No patients found</p>
          </div>
        }

        <!-- Patient list -->
        @for (p of patients(); track p.id) {
          <app-patient-card [patient]="p" />
        }

        <!-- Loading skeleton -->
        @if (loading() && patients().length === 0) {
          <div class="space-y-3">
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
            <div class="card animate-pulse h-16"></div>
          </div>
        }

        <app-load-more-button
          [isLoading]="loading() && patients().length > 0"
          [hasMore]="hasMore()"
          (clicked)="fetchPatients(skip())"
        />
      </div>
    </app-layout>
  `,
})
export class PatientsComponent {
  private http = inject(HttpClient);

  readonly diabetesTypes = DIABETES_TYPES;

  search = signal('');
  typeFilter = signal('');
  patients = signal<any[]>([]);
  skip = signal(0);
  hasMore = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Debounce search: skip the initial emission, fire resetAndFetch after 300ms idle
    toObservable(this.search).pipe(
      skip(1),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(() => this.resetAndFetch());

    this.fetchPatients(0);
  }

  onTypeFilterChange(value: string): void {
    this.typeFilter.set(value);
    this.resetAndFetch();
  }

  clearSearch(): void {
    this.search.set('');
    this.resetAndFetch();
  }

  private resetAndFetch(): void {
    this.patients.set([]);
    this.skip.set(0);
    this.hasMore.set(false);
    this.error.set(null);
    this.fetchPatients(0);
  }

  fetchPatients(currentSkip: number): void {
    this.loading.set(true);
    debugger;
    const params = new URLSearchParams({ skip: String(currentSkip), limit: String(PAGE_SIZE) });
    if (this.search()) params.set('search', this.search());
    if (this.typeFilter()) params.set('diabetes_type', this.typeFilter());
    this.http.get<any>(`/api/v1/patients?${params}`).subscribe({
      next: (data) => {
        const list: any[] = data.patients ?? data;
        this.patients.update(c => currentSkip === 0 ? list : [...c, ...list]);
        this.hasMore.set(data.has_more ?? false);
        this.skip.set(currentSkip + PAGE_SIZE);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || String(err));
        this.loading.set(false);
      },
    });
  }
}
