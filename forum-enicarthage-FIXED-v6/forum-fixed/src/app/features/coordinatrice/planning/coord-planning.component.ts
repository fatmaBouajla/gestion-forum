import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-coord-planning',
  templateUrl: './coord-planning.component.html',
  styleUrls: ['./coord-planning.component.scss'],
})
export class CoordPlanningComponent implements OnInit {
  workshops: any[] = [];
  loading = false;

  private api = `${environment.apiUrl}/workshops`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(this.api).subscribe({
      next: all => {
        // Planning = uniquement les workshops validés, triés par date
        this.workshops = all
          .filter(w => w.statut === 'VALIDE')
          .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
        this.loading = false;
      },
      error: () => { this.workshops = []; this.loading = false; }
    });
  }

  get groupedByDate(): { date: string, items: any[] }[] {
    const map = new Map<string, any[]>();
    for (const w of this.workshops) {
      const key = new Date(w.dateHeure).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }

  heure(dateHeure: string): string {
    return new Date(dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  comiteNom(w: any): string {
    return w.comite?.nom || w.comiteNom || '—';
  }
}
