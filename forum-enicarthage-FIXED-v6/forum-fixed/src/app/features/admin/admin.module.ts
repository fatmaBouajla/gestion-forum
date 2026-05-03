import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { ComitesComponent } from './comites/comites.component';
import { ForumProjectComponent } from './forum-project/forum-project.component';
import { HistoriqueComponent } from './historique/historique.component';

const routes: Routes = [
  { path: 'dashboard',      component: AdminDashboardComponent },
  { path: 'utilisateurs',   component: UtilisateursComponent },
  { path: 'comites',        component: ComitesComponent },
  { path: 'forum-project',  component: ForumProjectComponent },
  { path: 'historique',     component: HistoriqueComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AdminDashboardComponent, UtilisateursComponent,
    ComitesComponent, ForumProjectComponent, HistoriqueComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
