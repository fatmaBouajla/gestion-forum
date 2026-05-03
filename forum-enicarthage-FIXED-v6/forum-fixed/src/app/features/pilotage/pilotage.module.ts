/* src/app/features/pilotage/pilotage.module.ts */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PilotageDashboardComponent } from './dashboard/pilotage-dashboard.component';
import { CandidaturesCVComponent } from './cvs/candidatures-cv.component';
import { ModuleIAComponent } from './ia/module-ia.component';
import { RapportsComponent } from './rapports/rapports.component';
import { AvancementComponent } from './avancement/avancement.component';

const routes: Routes = [
  { path: 'dashboard',  component: PilotageDashboardComponent },
  { path: 'cvs',        component: CandidaturesCVComponent },
  { path: 'ia',         component: ModuleIAComponent },
  { path: 'rapports',   component: RapportsComponent },
  { path: 'avancement', component: AvancementComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    PilotageDashboardComponent, CandidaturesCVComponent,
    ModuleIAComponent, RapportsComponent, AvancementComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PilotageModule {}
