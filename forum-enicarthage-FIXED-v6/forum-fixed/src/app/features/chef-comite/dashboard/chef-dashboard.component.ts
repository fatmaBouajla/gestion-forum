import { Component, OnInit } from '@angular/core';
import { TacheService, ComiteService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Tache, Comite } from '../../../core/models';

@Component({
  selector: 'app-chef-dashboard',
  templateUrl: './chef-dashboard.component.html',
  styleUrls: ['./chef-dashboard.component.scss'],
})
export class ChefDashboardComponent implements OnInit {
  comite: Comite | null = null;
  taches: Tache[] = [];
  loading = true;
  comiteLoading = true;

  constructor(
    private tacheService: TacheService,
    private comiteService: ComiteService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    // Charger le comité dont cet utilisateur est chef (dynamique, pas hardcodé)
    this.comiteService.getMonComite().subscribe({
      next: c => {
        this.comite = c;
        this.comiteLoading = false;
        // Backend : GET /taches filtre déjà les tâches du comité du chef connecté
        this.tacheService.getAll().subscribe({
          next: t => { this.taches = t; this.loading = false; },
          error: () => { this.taches = []; this.loading = false; },
        });
      },
      error: () => {
        this.comiteLoading = false;
        this.loading = false;
        // Pas encore assigné à un comité
        this.comite = null;
      }
    });
  }

  get dernieresToughes(): Tache[] { return this.taches.slice(0, 4); }
  get aFaire():    number { return this.taches.filter(t => t.statut === 'A_FAIRE').length; }
  get enCours():   number { return this.taches.filter(t => t.statut === 'EN_COURS').length; }
  get terminees(): number { return this.taches.filter(t => t.statut === 'TERMINEE').length; }
  get enRetard():  number { return this.taches.filter(t => t.statut === 'EN_RETARD').length; }

  get avancement(): number {
    if (!this.taches.length) return 0;
    return Math.round((this.terminees / this.taches.length) * 100);
  }

  comiteIcon(nom: string): string {
    const map: Record<string, string> = {
      Design:'🎨', Sponsoring:'🤝', Logistique:'🏗',
      Programme:'📅', Media:'📸', Projet:'⚙'
    };
    return map[nom] ?? '📋';
  }

  dotClass(statut: string): string {
    return statut.toLowerCase().replace('_', '-');
  }

  get userName(): string {
    return this.auth.currentUser?.nom?.split(' ')[0] || 'Chef';
  }
}
