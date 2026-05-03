/* src/app/shared/shared.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SidebarComponent }      from './components/sidebar/sidebar.component';
import { TopbarComponent }       from './components/topbar/topbar.component';
import { LayoutComponent }       from './components/layout/layout.component';
import { StatutBadgeComponent }  from './components/statut-badge/statut-badge.component';
import { StatCardComponent }     from './components/stat-card/stat-card.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { StatutPipe }            from './pipes/statut.pipe';

@NgModule({
  declarations: [
    SidebarComponent, TopbarComponent, LayoutComponent,
    StatutBadgeComponent, StatCardComponent, ConfirmModalComponent,
    StatutPipe,
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  exports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    SidebarComponent, TopbarComponent, LayoutComponent,
    StatutBadgeComponent, StatCardComponent, ConfirmModalComponent,
    StatutPipe,
  ],
})
export class SharedModule {}
