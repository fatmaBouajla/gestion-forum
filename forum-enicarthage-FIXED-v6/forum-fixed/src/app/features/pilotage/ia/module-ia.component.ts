import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CandidatureCVService } from '../../../core/services/api.services';
import { CandidatureCV } from '../../../core/models';

@Component({
  selector: 'app-module-ia',
  templateUrl: './module-ia.component.html',
  styleUrls: ['./module-ia.component.scss'],
})
export class ModuleIAComponent implements OnInit {
  candidatures: CandidatureCV[] = [];
  loading = false;
  analysing = false;

  mockData: CandidatureCV[] = [
    { id:2, candidatNom:'Sara Trabelsi',  posteVise:'Coordinatrice Générale',  scoreIA:94, statut:'EN_ATTENTE', dateDepot:'2025-03-03', fichierCV:'cv_sara.pdf',    candidatId:11 },
    { id:1, candidatNom:'Ali Mansour',    posteVise:'Chef Comité Design',      scoreIA:87, statut:'EN_ATTENTE', dateDepot:'2025-03-01', fichierCV:'cv_ali.pdf',     candidatId:10 },
    { id:5, candidatNom:'Karim Belhaj',   posteVise:'Chef Comité Programme',   scoreIA:81, statut:'EN_ATTENTE', dateDepot:'2025-03-05', fichierCV:'cv_karim.pdf',   candidatId:14 },
    { id:3, candidatNom:'Youssef Hamdi',  posteVise:'Chef Comité Logistique',  scoreIA:72, statut:'ACCEPTE',    dateDepot:'2025-02-28', fichierCV:'cv_youssef.pdf', candidatId:12 },
    { id:4, candidatNom:'Lina Mrad',      posteVise:'Chef Comité Média',       scoreIA:65, statut:'REFUSE',     dateDepot:'2025-02-25', fichierCV:'cv_lina.pdf',    candidatId:13 },
  ];

  constructor(private cvService: CandidatureCVService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cvService.getAll().subscribe({
      next: c => {
        this.candidatures = c.sort((a, b) => (b.scoreIA || 0) - (a.scoreIA || 0));
        this.loading = false;
      },
      error: () => {
        this.candidatures = this.mockData;
        this.loading = false;
      },
    });
  }

  analyserTous(): void {
    const pending = this.candidatures.filter(x => x.statut === 'EN_ATTENTE');
    if (!pending.length) return;
    this.analysing = true;
    forkJoin(
      pending.map(p =>
        this.cvService.analyserIA(p.id).pipe(catchError(() => of(null)))
      )
    ).subscribe(results => {
      results.forEach((updated, i) => {
        if (!updated) return;
        const idx = this.candidatures.findIndex(c => c.id === pending[i].id);
        if (idx >= 0) this.candidatures[idx] = updated;
      });
      this.candidatures.sort((a, b) => (b.scoreIA || 0) - (a.scoreIA || 0));
      this.analysing = false;
    });
  }

  scoreColor(s: number): string {
    if (s >= 85) return '#10B981';
    if (s >= 70) return '#F59E0B';
    return '#EF4444';
  }

  scoreBg(s: number): string {
    if (s >= 85) return '#D1FAE5';
    if (s >= 70) return '#FEF3C7';
    return '#FEE2E2';
  }

  justification(c: CandidatureCV): string {
    if (c.justificationIA?.trim()) return c.justificationIA;
    const s = c.scoreIA;
    if (s >= 85) return 'Profil excellent — compétences très alignées avec le poste.';
    if (s >= 70) return 'Bon profil — quelques points à approfondir en entretien.';
    return 'Profil insuffisant — compétences peu alignées avec le poste.';
  }
}
