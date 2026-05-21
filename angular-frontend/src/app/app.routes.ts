import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
	},
	{
		path: 'patients',
		loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
	},
	{
		path: 'patients/:id',
		loadComponent: () => import('./pages/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
	},
	{
		path: 'settings',
		loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
	},
	{ path: '**', redirectTo: '' },
];
