import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ChefDashboardComponent }  from './dashboard/chef-dashboard.component';
import { ChefTachesComponent }     from './taches/chef-taches.component';
import { ChefMembresComponent }    from './membres/chef-membres.component';
import { ChefComiteViewComponent } from './comite/chef-comite-view.component';

const routes: Routes = [
  { path: 'dashboard', component: ChefDashboardComponent },
  { path: 'taches',    component: ChefTachesComponent },
  { path: 'membres',   component: ChefMembresComponent },
  { path: 'comite',    component: ChefComiteViewComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [ChefDashboardComponent, ChefTachesComponent, ChefMembresComponent, ChefComiteViewComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ChefComiteModule {}
