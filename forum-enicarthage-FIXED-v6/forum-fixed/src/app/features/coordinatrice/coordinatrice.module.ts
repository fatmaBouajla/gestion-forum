/* src/app/features/coordinatrice/coordinatrice.module.ts */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CoordDashboardComponent }  from './dashboard/coord-dashboard.component';
import { CoordWorkshopsComponent }  from './workshops/coord-workshops.component';
import { CoordTachesComponent }     from './taches/coord-taches.component';
import { CoordComitesComponent }    from './comites/coord-comites.component';
import { CoordPlanningComponent }   from './planning/coord-planning.component';

const routes: Routes = [
  { path:'dashboard', component:CoordDashboardComponent },
  { path:'workshops', component:CoordWorkshopsComponent },
  { path:'taches',    component:CoordTachesComponent    },
  { path:'comites',   component:CoordComitesComponent   },
  { path:'planning',  component:CoordPlanningComponent  },
  { path:'', redirectTo:'dashboard', pathMatch:'full'   },
];

@NgModule({
  declarations:[CoordDashboardComponent,CoordWorkshopsComponent,CoordTachesComponent,CoordComitesComponent,CoordPlanningComponent],
  imports:[SharedModule,RouterModule.forChild(routes)],
})
export class CoordinatriceModule {}
