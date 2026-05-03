import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StatistiquesService } from '../../../core/services/api.services';
import { KPIs, AvancementComite } from '../../../core/models';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  kpis: KPIs | null = null;
  avancements: AvancementComite[] = [];
  loading = true;

  private mockKPIs: KPIs = {
    totalUtilisateurs: 48, totalTaches: 200,
    tachesTerminees: 108, tachesEnRetard: 12,
    tachesAFaire: 28, tachesEnCours: 52,
    totalWorkshops: 18, workshopsValides: 11,
    totalCandidatures: 87, avancementGlobal: 54,
  };

  private mockAvancements: AvancementComite[] = [
    { comiteNom: 'Design',      total: 38, terminees: 35, avancement: 92 },
    { comiteNom: 'Sponsoring',  total: 32, terminees: 25, avancement: 78 },
    { comiteNom: 'Logistique',  total: 40, terminees: 26, avancement: 65 },
    { comiteNom: 'Programme',   total: 30, terminees: 24, avancement: 80 },
    { comiteNom: 'Média',       total: 35, terminees: 19, avancement: 55 },
    { comiteNom: 'Projet',      total: 25, terminees: 9,  avancement: 38 },
  ];

  private chartComites: Chart | null = null;
  private chartTaches: Chart | null = null;

  constructor(private statsService: StatistiquesService) {}

  ngOnInit(): void {
    forkJoin({
      kpis: this.statsService.getKPIs(),
      av: this.statsService.getAvancementComites(),
    }).subscribe({
      next: ({ kpis, av }) => {
        this.kpis = kpis as KPIs;
        this.avancements = av;
        this.loading = false;
        setTimeout(() => this.buildCharts(), 50);
      },
      error: () => {
        this.kpis = this.mockKPIs;
        this.avancements = this.mockAvancements;
        this.loading = false;
        setTimeout(() => this.buildCharts(), 50);
      },
    });
  }

  private avData(): AvancementComite[] {
    return this.avancements?.length ? this.avancements : this.mockAvancements;
  }

  buildCharts(): void {
    const barSrc = this.avData();
    const c1 = document.getElementById('chartComites') as HTMLCanvasElement;
    if (c1) {
      this.chartComites?.destroy();
      this.chartComites = new Chart(c1, {
        type: 'bar',
        data: {
          labels: barSrc.map(a => a.comiteNom),
          datasets: [{
            label: 'Avancement %',
            data: barSrc.map(a => a.avancement),
            backgroundColor: ['#10B981','#1E40AF','#F59E0B','#1E40AF','#F59E0B','#EF4444'],
            borderRadius: 8, barThickness: 32,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100, ticks: { callback: (v) => v + '%' } } },
        },
      });
    }

    const c2 = document.getElementById('chartTaches') as HTMLCanvasElement;
    const k = this.kpis ?? this.mockKPIs;
    const term = k.tachesTerminees;
    const ret = k.tachesEnRetard;
    let enCours = k.tachesEnCours;
    let aFaire = k.tachesAFaire;
    if (enCours === undefined && aFaire === undefined) {
      const rest = Math.max(0, k.totalTaches - term - ret);
      enCours = Math.floor(rest / 2);
      aFaire = rest - enCours;
    } else {
      enCours = enCours ?? 0;
      aFaire = aFaire ?? Math.max(0, k.totalTaches - term - ret - enCours);
    }
    if (c2) {
      this.chartTaches?.destroy();
      this.chartTaches = new Chart(c2, {
        type: 'doughnut',
        data: {
          labels: ['À faire', 'En cours', 'Terminées', 'En retard'],
          datasets: [{
            data: [aFaire, enCours, term, ret],
            backgroundColor: ['#E2E8F0', '#1E40AF', '#10B981', '#EF4444'],
            borderWidth: 0, hoverOffset: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14 } } },
          cutout: '68%',
        },
      });
    }
  }

  get tachesPercent(): number {
    if (!this.kpis) return 0;
    return Math.round((this.kpis.tachesTerminees / this.kpis.totalTaches) * 100);
  }
}
