import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-coord-comites',
  templateUrl: './coord-comites.component.html',
  styleUrls: ['./coord-comites.component.scss'],
})
export class CoordComitesComponent implements OnInit {
  comites: any[] = [];
  loading = false;
  selectedComite: any = null;

  private api = `${environment.apiUrl}/comites`;
  private apiTaches = `${environment.apiUrl}/taches`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(this.api).subscribe({
      next: c  => { this.comites = c; this.loading = false; },
      error: () => { this.comites = []; this.loading = false; }
    });
  }

  selectComite(c: any): void {
    this.selectedComite = this.selectedComite?.id === c.id ? null : c;
  }

  avancement(c: any): number {
    if (!c.nombreTaches || c.nombreTaches === 0) return 0;
    return Math.round((c.tachesTerminees || 0) / c.nombreTaches * 100);
  }

  avancementClass(pct: number): string {
    if (pct >= 75) return 'good';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  comiteIcon(nom: string): string {
    const map: Record<string, string> = {
      'Sponsoring': '💼', 'Design': '🎨', 'Logistique': '📦',
      'Projet': '🗂', 'Programme': '📋', 'Média': '📸',
    };
    return map[nom] ?? '🏛';
  }
}
