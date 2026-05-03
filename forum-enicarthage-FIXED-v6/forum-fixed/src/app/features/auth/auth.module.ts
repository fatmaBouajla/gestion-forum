import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CandidatureChefComponent } from './candidature-chef/candidature-chef.component';
import { InscriptionMembreComponent } from './inscription-membre/inscription-membre.component';

const routes: Routes = [
  { path: 'login',              component: LoginComponent },
  { path: 'candidature-chef',   component: CandidatureChefComponent },
  { path: 'inscription-membre', component: InscriptionMembreComponent },
  { path: '',                   redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    LoginComponent,
    CandidatureChefComponent,
    InscriptionMembreComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AuthModule {}
