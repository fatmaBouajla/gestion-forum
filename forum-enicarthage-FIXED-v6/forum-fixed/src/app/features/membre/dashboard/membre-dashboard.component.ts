import { Component, OnInit } from '@angular/core';
import { TacheService, NotificationService } from '../../../core/services/api.services';
import { Tache, Notification } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-membre-dashboard',
  templateUrl: './membre-dashboard.component.html',
  styleUrls: ['./membre-dashboard.component.scss'],
})
export class MembreDashboardComponent implements OnInit {
  taches: Tache[] = [];
  notifications: Notification[] = [];

  mockTaches: Tache[] = [
    { id:1, titre:'Affiche principale Forum',   description:'Design A3 pour impression', dateDebut:'2025-02-01', dateFin:'2025-03-10', priorite:'URGENTE', statut:'TERMINEE',  comiteId:2, comiteNom:'Design' },
    { id:2, titre:'Bannières réseaux sociaux',  description:'Formats LinkedIn, IG, FB',  dateDebut:'2025-02-15', dateFin:'2025-03-20', priorite:'NORMALE', statut:'EN_COURS',  comiteId:2, comiteNom:'Design' },
    { id:3, titre:'Vidéo teaser 60s',           description:'Motion design du Forum',    dateDebut:'2025-03-15', dateFin:'2025-04-10', priorite:'URGENTE', statut:'EN_RETARD', comiteId:2, comiteNom:'Design' },
  ];

  mockNotifs: Notification[] = [
    { id:1, message:'Nouvelle tâche assignée : Affiche principale Forum', lu:false, dateEnvoi:'2025-02-10T09:00', type:'ASSIGNATION' },
    { id:2, message:'⏰ Rappel : Vidéo teaser 60s dépasse son échéance',  lu:false, dateEnvoi:'2025-03-16T08:00', type:'RETARD' },
    { id:3, message:'Votre tâche Bannières réseaux sociaux est validée',  lu:true,  dateEnvoi:'2025-02-06T14:00', type:'VALIDATION' },
  ];

  constructor(
    private tacheService: TacheService,
    private notifService: NotificationService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.tacheService.getMesTaches().subscribe({
      next: t => this.taches = t,
      error: () => this.taches = this.mockTaches
    });
    this.notifService.getNonLues().subscribe({
      next: n => this.notifications = n.slice(0, 4),
      error: () => this.notifications = this.mockNotifs
    });
  }

  get userName(): string { return this.auth.currentUser?.nom?.split(' ')[0] || 'Utilisateur'; }
  get tachesEnCours():  Tache[] { return this.taches.filter(t => t.statut === 'EN_COURS'); }
  get tachesUrgentes(): Tache[] { return this.taches.filter(t => t.priorite === 'URGENTE' && t.statut !== 'TERMINEE'); }
  get tachesTerminees():number   { return this.taches.filter(t => t.statut === 'TERMINEE').length; }
  get tachesEnRetard(): number   { return this.taches.filter(t => t.statut === 'EN_RETARD').length; }

  typeIcon(type: string): string {
    return { RETARD:'⏰', ASSIGNATION:'📌', VALIDATION:'✅', ALERTE:'⚠️', INFO:'ℹ️' }[type] ?? 'ℹ️';
  }
}
