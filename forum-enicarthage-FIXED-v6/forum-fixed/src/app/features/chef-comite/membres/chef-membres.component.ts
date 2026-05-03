import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ComiteService, CandidatureCVService } from '../../../core/services/api.services';
import { User } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-chef-membres',
  templateUrl: './chef-membres.component.html',
  styleUrls: ['./chef-membres.component.scss'],
})
export class ChefMembresComponent implements OnInit {
  membres: User[] = [];
  demandesEnAttente: any[] = [];
  comiteId: number | null = null;
  comiteNom: string = '';
  loading = true;
  errorMsg = '';
  detailLoading = false;
  detailError = '';
  selectedDemande: any | null = null;

  constructor(
    private comiteService: ComiteService,
    private cvService: CandidatureCVService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.comiteService.getMonComite().subscribe({
      next: c => {
        this.comiteId = c.id;
        this.comiteNom = c.nom ?? '';
        this.membres = (c.membres as User[]) ?? [];
        this.loading = false;
        this.loadDemandes(c.nom);
      },
      error: () => {
        this.errorMsg = 'Impossible de charger votre comité.';
        this.loading = false;
      },
    });
  }

  loadDemandes(comiteNom: string): void {
    this.http.get<any[]>(`${environment.apiUrl}/candidatures`).subscribe({
      next: candidatures => {
        this.demandesEnAttente = candidatures.filter(c =>
          c.statut === 'EN_ATTENTE' &&
          c.dossierComplet?.toLowerCase().includes((comiteNom || '').toLowerCase())
        );
      },
      error: () => { this.demandesEnAttente = []; }
    });
  }

  parseDossier(dossierComplet: string | any): {label: string, value: string}[] {
    if (!dossierComplet || typeof dossierComplet !== 'string') return [];
    return dossierComplet.split('|').map(part => {
      const [label, ...rest] = part.trim().split(':');
      return { label: label?.trim(), value: rest.join(':').trim() };
    }).filter(item => item.label && item.value && item.value !== '-');
  }

  selectDemande(d: any): void {
    this.selectedDemande = null;
    this.detailLoading = true;
    this.detailError = '';
    this.cvService.getById(d.id).subscribe({
      next: detail => {
        this.selectedDemande = detail;
        this.detailLoading = false;
      },
      error: () => {
        this.detailError = 'Impossible de charger les détails de la candidature.';
        this.detailLoading = false;
      }
    });
  }

  closeDemande(): void {
    this.selectedDemande = null;
    this.detailError = '';
  }

  accepter(candidature: any): void {
    this.http.put(`${environment.apiUrl}/candidatures/${candidature.id}/accepter`, {}).subscribe({
      next: () => {
        this.demandesEnAttente = this.demandesEnAttente.filter(d => d.id !== candidature.id);
        if (this.selectedDemande?.id === candidature.id) this.selectedDemande = null;
      }
    });
  }

  refuser(candidature: any): void {
    this.http.put(`${environment.apiUrl}/candidatures/${candidature.id}/refuser`, null, {
      params: { commentaire: 'Refusé par le chef de comité' }
    }).subscribe({
      next: () => {
        this.demandesEnAttente = this.demandesEnAttente.filter(d => d.id !== candidature.id);
        if (this.selectedDemande?.id === candidature.id) this.selectedDemande = null;
      }
    });
  }

  retirer(id: number): void {
    if (this.comiteId == null) return;
    this.comiteService.retirerMembre(this.comiteId, id).subscribe({
      next: c => { this.membres = (c.membres as User[]) ?? []; },
    });
  }

  telechargerCV(id: number): void {
    this.http.get(`${environment.apiUrl}/candidatures/${id}/telecharger-cv`,
      { responseType: 'blob' }
    ).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_candidat_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  initials(nom: string): string {
    return nom?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  }
}
