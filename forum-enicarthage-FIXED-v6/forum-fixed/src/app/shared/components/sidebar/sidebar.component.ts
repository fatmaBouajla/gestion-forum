import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/api.services';
import { User } from '../../../core/models';

interface NavItem {
  label: string; icon: string; route: string; badge?: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  user: User | null = null;
  navItems: NavItem[] = [];
  unreadCount = 0;
  collapsed = false;

  private navMap: Record<string, NavItem[]> = {
    ADMIN: [
      { label: 'Dashboard',       icon: '⊞',  route: '/admin/dashboard' },
      { label: 'Forum Project',   icon: '🏛',  route: '/admin/forum-project' },
      { label: 'Utilisateurs',    icon: '👥',  route: '/admin/utilisateurs' },
      { label: 'Comités',         icon: '📋',  route: '/admin/comites' },
      { label: 'Historique',      icon: '📁',  route: '/admin/historique' },
      { label: 'Configuration',   icon: '⚙',   route: '/admin/config' },
    ],
    COMITE_PILOTAGE: [
      { label: 'Dashboard',       icon: '⊞',  route: '/pilotage/dashboard' },
      { label: 'Avancement',      icon: '📊',  route: '/pilotage/avancement' },
      { label: 'Candidatures CV', icon: '📄',  route: '/pilotage/cvs' },
      { label: 'Module IA',       icon: '🤖',  route: '/pilotage/ia' },
      { label: 'Rapports',        icon: '📑',  route: '/pilotage/rapports' },
    ],
    COORDINATRICE: [
      { label: 'Dashboard',       icon: '⊞',  route: '/coordinatrice/dashboard' },
      { label: 'Comités',         icon: '📋',  route: '/coordinatrice/comites' },
      { label: 'Tâches',          icon: '✅',  route: '/coordinatrice/taches' },
      { label: 'Workshops',       icon: '🎓',  route: '/coordinatrice/workshops' },
      { label: 'Planning',        icon: '📅',  route: '/coordinatrice/planning' },
    ],
    CHEF_COMITE: [
      { label: 'Dashboard',       icon: '⊞',  route: '/chef-comite/dashboard' },
      { label: 'Mon Comité',      icon: '👥',  route: '/chef-comite/comite' },
      { label: 'Tâches',          icon: '✅',  route: '/chef-comite/taches' },
      { label: 'Membres',         icon: '👤',  route: '/chef-comite/membres' },
      { label: 'Workshops',       icon: '🎓',  route: '/chef-comite/workshops' },  // ← ajouté
    ],
    MEMBRE: [
      { label: 'Dashboard',       icon: '⊞',  route: '/membre/dashboard' },
      { label: 'Mes Tâches',      icon: '✅',  route: '/membre/taches' },
      { label: 'Notifications',   icon: '🔔',  route: '/membre/notifications' },
    ],
  };

  constructor(
    private auth: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.navItems = this.navMap[this.user?.role ?? ''] ?? [];
    this.loadUnread();
  }

  loadUnread(): void {
    this.notifService.getNonLues().subscribe({
      next: (n) => {
        this.unreadCount = n.length;
        const notifItem = this.navItems.find(i => i.label === 'Notifications');
        if (notifItem) notifItem.badge = this.unreadCount;
      },
      error: () => {}
    });
  }

  isActive(route: string): boolean { return this.router.url.startsWith(route); }

  logout(): void { this.auth.logout(); }

  get roleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur', COMITE_PILOTAGE: 'Comité Pilotage',
      COORDINATRICE: 'Coordinatrice', CHEF_COMITE: 'Chef de Comité', MEMBRE: 'Membre',
    };
    return map[this.user?.role ?? ''] ?? '';
  }

  get initials(): string {
    return this.user?.nom?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';
  }
}
