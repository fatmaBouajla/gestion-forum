import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CandidatureCVService } from '../../../core/services/api.services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-candidatures-cv',
  templateUrl: './candidatures-cv.component.html',
  styleUrls: ['./candidatures-cv.component.scss'],
})
export class CandidaturesCVComponent implements OnInit {
  candidatures: any[] = [];
  loading = false;
  detailLoading = false;
  detailError = '';
  filter = 'TOUS';
  selected: any | null = null;
  selectedDossierParsed: {label: string, value: string}[] = [];
  showDetail = false;
  showRefuserModal = false;
  refuserId: number | null = null;
  commentaireForm: FormGroup;
  analysing: number | null = null;
  filters = ['TOUS', 'EN_ATTENTE', 'ACCEPTE', 'REFUSE'];

  constructor(
    private cvService: CandidatureCVService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.commentaireForm = this.fb.group({ commentaire: ['', Validators.required] });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cvService.getAll().subscribe({
      next: c => { this.candidatures = c; this.loading = false; },
      error: () => { this.candidatures = []; this.loading = false; },
    });
  }

  get filtered(): any[] {
    return this.filter === 'TOUS'
      ? this.candidatures
      : this.candidatures.filter(c => c.statut === this.filter);
  }

  statutCount(f: string): number {
    return f === 'TOUS'
      ? this.candidatures.length
      : this.candidatures.filter(c => c.statut === f).length;
  }

  parseDossier(dossierComplet: string | undefined): {label: string, value: string}[] {
    if (!dossierComplet) return [];
    return dossierComplet.split('|').map(part => {
      const [label, ...rest] = part.trim().split(':');
      return { label: label?.trim(), value: rest.join(':').trim() };
    }).filter(item => item.label && item.value && item.value !== '-');
  }

  analyserIA(c: any): void {
    this.analysing = c.id;
    this.cvService.analyserIA(c.id).subscribe({
      next: updated => {
        const idx = this.candidatures.findIndex(x => x.id === updated.id);
        if (idx >= 0) this.candidatures[idx] = updated;
        if (this.selected?.id === updated.id) this.selected = { ...updated };
        this.analysing = null;
      },
      error: () => { this.analysing = null; },
    });
  }

  accepter(c: any): void {
    this.cvService.accepter(c.id).subscribe({
      next: () => {
        c.statut = 'ACCEPTE';
        if (this.selected?.id === c.id) this.selected.statut = 'ACCEPTE';
        this.showDetail = false;
        this.load();
      },
      error: () => { c.statut = 'ACCEPTE'; },
    });
  }

  openRefuser(id: number): void {
    this.refuserId = id;
    this.commentaireForm.reset();
    this.showRefuserModal = true;
  }

  doRefuser(): void {
    if (this.commentaireForm.invalid) return;
    this.cvService.refuser(this.refuserId!, this.commentaireForm.value.commentaire).subscribe({
      next: () => { this.setRefuse(); this.load(); },
      error: () => { this.setRefuse(); },
    });
  }

  private setRefuse(): void {
    const c = this.candidatures.find(x => x.id === this.refuserId);
    if (c) c.statut = 'REFUSE';
    this.showRefuserModal = false;
    this.showDetail = false;
  }

  openDetail(c: any): void {
    this.detailLoading = true;
    this.detailError = '';
    this.showDetail = true;
    this.cvService.getById(c.id).subscribe({
      next: detail => {
        this.selected = detail;
        this.selectedDossierParsed = this.parseDossier(detail.dossierComplet);
        this.detailLoading = false;
      },
      error: () => {
        this.detailError = 'Impossible de charger les détails de la candidature.';
        this.detailLoading = false;
      }
    });
  }

  // ← MÉTHODE MANQUANTE
  telechargerCv(c: any, ev: Event): void {
    ev.preventDefault();
    this.cvService.telechargerCv(c.id).subscribe({
      next: blob => {
        const name = (c.fichierCV || 'cv').split(/[/\\]/).pop() || 'cv.pdf';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name.includes('.') ? name : `${name}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  scoreColor(s: number): string {
    if (s >= 85) return 'score-high';
    if (s >= 70) return 'score-mid';
    return 'score-low';
  }

  get f() { return this.commentaireForm.controls; }
}
