/* src/app/features/pilotage/dashboard/pilotage-dashboard.component.ts */
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StatistiquesService, TacheService } from '../../../core/services/api.services';
import { KPIs, AvancementComite, Tache } from '../../../core/models';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-pilotage-dashboard',
  templateUrl: './pilotage-dashboard.component.html',
  styleUrls: ['./pilotage-dashboard.component.scss'],
})
export class PilotageDashboardComponent implements OnInit {
  kpis: KPIs | null = null;
  avancements: AvancementComite[] = [];
  tachesRetard: Tache[] = [];

  private mockAv: AvancementComite[] = [
    { comiteNom: 'Design',     total: 38, terminees: 35, avancement: 92 },
    { comiteNom: 'Sponsoring', total: 32, terminees: 25, avancement: 78 },
    { comiteNom: 'Logistique', total: 40, terminees: 26, avancement: 65 },
    { comiteNom: 'Programme',  total: 30, terminees: 24, avancement: 80 },
    { comiteNom: 'Média',      total: 35, terminees: 19, avancement: 55 },
    { comiteNom: 'Projet',     total: 25, terminees: 9,  avancement: 38 },
  ];

  private chartInstance: Chart | null = null;

private fallbackKpis: KPIs = {
  totalUtilisateurs: 48, totalTaches: 200, tachesTerminees: 108, tachesEnRetard: 12,
  totalWorkshops: 18, workshopsValides: 11, totalCandidatures: 87, avancementGlobal: 54,
  tachesAFaire: 0, tachesEnCours: 0,  // ← AJOUTER
};

  constructor(private stats: StatistiquesService, private tacheService: TacheService) {}

  ngOnInit(): void {
    forkJoin({
      kpis: this.stats.getKPIs(),
      av: this.stats.getAvancementComites(),
      retard: this.tacheService.getAll({ statut: 'EN_RETARD' }),
    }).subscribe({
      next: ({ kpis, av, retard }) => {
        this.kpis = kpis;
        this.avancements = av;
        this.tachesRetard = (retard ?? []).slice(0, 5);
        setTimeout(() => this.buildChart(), 50);
      },
      error: () => {
        this.kpis = this.fallbackKpis;
        this.avancements = this.mockAv;
        this.tachesRetard = [];
        setTimeout(() => this.buildChart(), 50);
      },
    });
  }

  private chartData(): AvancementComite[] {
    return this.avancements?.length ? this.avancements : this.mockAv;
  }

  buildChart(): void {
    const el = document.getElementById('chartAv') as HTMLCanvasElement;
    if (!el) return;
    const src = this.chartData();
    this.chartInstance?.destroy();
    this.chartInstance = new Chart(el, {
      type: 'bar',
      data: {
        labels: src.map(a => a.comiteNom),
        datasets: [
          { label: 'Terminées', data: src.map(a => a.terminees), backgroundColor: '#10B981', borderRadius: 6 },
          {
            label: 'Restantes',
            data: src.map(a => (a.total ?? 0) - a.terminees),
            backgroundColor: '#F1F5F9',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
        scales: { x: { stacked: true }, y: { stacked: true } },
      },
    });
  }

  statusColor(s: string): string {
    return { A_FAIRE:'a-faire',EN_COURS:'en-cours',TERMINEE:'terminee',EN_RETARD:'en-retard' }[s] ?? '';
  }
}
