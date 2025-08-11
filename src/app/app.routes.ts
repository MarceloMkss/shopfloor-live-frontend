import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'machines',
    loadComponent: () =>
      import('./features/machines/pages/machine-list/machine-list-component')
        .then(m => m.MachineListComponent)   // ← nombre EXACTO de la clase
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/machines/pages/dashboard-component/dashboard-component')
        .then(c => c.DashboardComponent)     // ← nombre EXACTO de la clase
  },
  { path: '', redirectTo: 'machines', pathMatch: 'full' }
];
