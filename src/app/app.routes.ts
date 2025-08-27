import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/patients/patients.component').then(
        (c) => c.PatientsComponent
      ),
  },
  {
    path: 'patients/new',
    loadComponent: () =>
      import('./Pages/patient-form/patient-form.component').then(
        (c) => c.PatientsFormComponent
      ),
  },
  {
    path: 'patients/edit/:id',
    loadComponent: () =>
      import('./Pages/patient-form/patient-form.component').then(
        (c) => c.PatientsFormComponent
      ),
  },
  {
    path: '**', // rota coringa (404)
    redirectTo: '',
  },
];
