import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  @Input() title = '';
  @Input() subtitle = '';

  notifications: Notification[] = [];
  showNotifs = false;
  unreadCount = 0;

  constructor(
    private notifService: NotificationService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadNotifs(); }

  loadNotifs(): void {
    this.notifService.getNonLues().subscribe({
      next: (n) => { this.notifications = n.slice(0, 5); this.unreadCount = n.length; },
      error: () => {}
    });
  }

  markRead(id: number): void {
    this.notifService.marquerLu(id).subscribe(() => this.loadNotifs());
  }

  markAllRead(): void {
    this.notifService.marquerToutLu().subscribe(() => { this.notifications = []; this.unreadCount = 0; });
  }

  get userInitials(): string {
    return this.auth.currentUser?.nom?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = { RETARD: '⏰', ASSIGNATION: '📌', VALIDATION: '✅', ALERTE: '⚠', INFO: 'ℹ' };
    return map[type] ?? 'ℹ';
  }
}
