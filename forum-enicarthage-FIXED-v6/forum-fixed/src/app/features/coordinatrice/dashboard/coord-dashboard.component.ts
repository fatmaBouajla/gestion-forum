import { Component, OnInit } from '@angular/core';
import { StatistiquesService } from '../../../core/services/api.services';
import { KPIs } from '../../../core/models';

@Component({
  selector: 'app-coord-dashboard',
  templateUrl: './coord-dashboard.component.html',
  styleUrls: ['./coord-dashboard.component.scss'],
})
export class CoordDashboardComponent implements OnInit {
  kpis: KPIs | null = null;
  alertes = [
    { msg: 'Comité Projet en retard — 3 tâches critiques', type: 'danger' },
    { msg: 'Workshop "IA & Métiers" non validé — J-5',    type: 'warning' },
    { msg: 'Comité Média dépasse le délai de reporting',   type: 'warning' },
  ];

  constructor(private stats: StatistiquesService) {}

  ngOnInit(): void {
    this.stats.getKPIs().subscribe({
      next: k => this.kpis = k,
   error: () => this.kpis = {
  totalUtilisateurs: 48, totalTaches: 200,
  tachesTerminees: 108, tachesEnRetard: 12,
  totalWorkshops: 18,   workshopsValides: 11,
  totalCandidatures: 87, avancementGlobal: 54,
  tachesAFaire: 0, tachesEnCours: 0,  // ← AJOUTER
},
    });
  }
}
