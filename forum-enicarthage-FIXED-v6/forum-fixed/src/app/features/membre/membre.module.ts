import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MembreDashboardComponent }       from './dashboard/membre-dashboard.component';
import { MembreTachesComponent }          from './taches/membre-taches.component';
import { MembreNotificationsComponent }   from './notifications/membre-notifications.component';

const routes: Routes = [
  { path: 'dashboard',     component: MembreDashboardComponent },
  { path: 'taches',        component: MembreTachesComponent },
  { path: 'notifications', component: MembreNotificationsComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [MembreDashboardComponent, MembreTachesComponent, MembreNotificationsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class MembreModule {}
