/* src/app/features/membre/notifications/membre-notifications.component.ts */
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/api.services';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-membre-notifications',
  templateUrl: './membre-notifications.component.html',
  styleUrls: ['./membre-notifications.component.scss'],
})
export class MembreNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;

  mockNotifs: Notification[] = [
    { id:1, message:'Nouvelle tâche assignée : Affiche principale Forum', lu:false, dateEnvoi:'2025-02-10T09:00', type:'ASSIGNATION' },
    { id:2, message:'⏰ Rappel : Vidéo teaser 60s dépasse son échéance',  lu:false, dateEnvoi:'2025-03-16T08:00', type:'RETARD'      },
    { id:3, message:'Votre tâche Bannières réseaux sociaux a été validée', lu:true,  dateEnvoi:'2025-02-06T14:00', type:'VALIDATION'  },
    { id:4, message:'Alerte : le comité Design a un blocage signalé',      lu:true,  dateEnvoi:'2025-02-05T10:30', type:'ALERTE'      },
  ];

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.loading = true;
    this.notifService.getMesNotifications().subscribe({
      next: n => { this.notifications = n; this.loading = false; },
      error: () => { this.notifications = this.mockNotifs; this.loading = false; },
    });
  }

  marquerLu(n: Notification): void {
    if (n.lu) return;
    this.notifService.marquerLu(n.id).subscribe({
      next: () => n.lu = true,
      error: () => n.lu = true,
    });
  }

  marquerToutLu(): void {
    this.notifService.marquerToutLu().subscribe({
      next: () => this.notifications.forEach(n => n.lu = true),
      error: () => this.notifications.forEach(n => n.lu = true),
    });
  }

  typeIcon(type: string): string {
    return { RETARD:'⏰', ASSIGNATION:'📌', VALIDATION:'✅', ALERTE:'⚠️', INFO:'ℹ️' }[type] ?? 'ℹ️';
  }

  typeBg(type: string): string {
    return { RETARD:'retard', ASSIGNATION:'info', VALIDATION:'success', ALERTE:'warning', INFO:'info' }[type] ?? 'info';
  }

  get unreadCount(): number { return this.notifications.filter(n => !n.lu).length; }
}
