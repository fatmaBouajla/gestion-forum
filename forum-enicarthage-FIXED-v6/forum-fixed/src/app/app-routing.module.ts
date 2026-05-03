/* src/app/app-routing.module.ts */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'pilotage',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['COMITE_PILOTAGE'] },
    loadChildren: () => import('./features/pilotage/pilotage.module').then(m => m.PilotageModule)
  },
  {
    path: 'coordinatrice',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['COORDINATRICE'] },
    loadChildren: () => import('./features/coordinatrice/coordinatrice.module').then(m => m.CoordinatriceModule)
  },
  {
    path: 'chef-comite',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CHEF_COMITE'] },
    loadChildren: () => import('./features/chef-comite/chef-comite.module').then(m => m.ChefComiteModule)
  },
  {
    path: 'membre',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MEMBRE'] },
    loadChildren: () => import('./features/membre/membre.module').then(m => m.MembreModule)
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
