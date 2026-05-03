import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Tache } from '../../../core/models';

@Component({
  selector: 'app-coord-taches',
  templateUrl: './coord-taches.component.html',
  styleUrls: ['./coord-taches.component.scss'],
})
export class CoordTachesComponent implements OnInit {
  taches: Tache[] = [];
  comites: any[] = [];
  membres: any[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  filterStatut = 'TOUS';
  filterComite = 'TOUS';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  form: FormGroup;
  statuts = ['TOUS', 'A_FAIRE', 'EN_COURS', 'TERMINEE', 'EN_RETARD'];

  private apiTaches = `${environment.apiUrl}/taches`;
  private apiComite = `${environment.apiUrl}/comites`;
  private apiUsers  = `${environment.apiUrl}/utilisateurs`;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      titre:       ['', Validators.required],
      description: [''],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
      priorite:    ['NORMALE'],
      statut:      ['A_FAIRE'],
      comiteId:    [null, Validators.required],
      membreId:    [null],
    });
  }

  ngOnInit(): void { this.load(); this.loadComites(); this.loadMembres(); }

  load(): void {
    this.loading = true;
    this.http.get<Tache[]>(this.apiTaches).subscribe({
      next: t => { this.taches = t; this.loading = false; },
      error: () => { this.taches = []; this.loading = false; }
    });
  }

  loadComites(): void {
    this.http.get<any[]>(this.apiComite).subscribe({
      next: c => this.comites = c,
      error: () => {}
    });
  }

  loadMembres(): void {
    this.http.get<any[]>(this.apiUsers).subscribe({
      next: (p: any) => {
        const all = Array.isArray(p) ? p : (p.content || []);
        this.membres = all.filter((u: any) => u.role === 'MEMBRE');
      },
      error: () => {}
    });
  }

  get filtered(): Tache[] {
    return this.taches.filter(t =>
      (this.filterStatut === 'TOUS' || t.statut === this.filterStatut) &&
      (this.filterComite === 'TOUS' || (t as any).comite?.nom === this.filterComite ||
       t.comiteNom === this.filterComite)
    );
  }

  get uniqueComites(): string[] {
    const noms = this.taches.map(t => (t as any).comite?.nom || t.comiteNom || '');
    return [...new Set(noms)].filter(Boolean);
  }

  countByStatut(s: string): number {
    return s === 'TOUS' ? this.taches.length : this.taches.filter(t => t.statut === s).length;
  }

  openCreate(): void {
    this.editMode = false; this.editId = null; this.errorMsg = '';
    this.form.reset({ priorite: 'NORMALE', statut: 'A_FAIRE' });
    this.showModal = true;
  }

  openEdit(t: Tache): void {
    this.editMode = true; this.editId = t.id; this.errorMsg = '';
    this.form.patchValue({
      titre: t.titre, description: t.description,
      dateDebut: t.dateDebut, dateFin: t.dateFin,
      priorite: t.priorite, statut: t.statut,
      comiteId: (t as any).comite?.id || t.comiteId,
      membreId: (t as any).membre?.id || t.membreId
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = '';

    const val = this.form.value;
    const body = {
      titre:       val.titre,
      description: val.description || '',
      dateDebut:   val.dateDebut,
      dateFin:     val.dateFin,
      priorite:    val.priorite,
      statut:      val.statut,
      comiteId:    val.comiteId,
      membreId:    val.membreId || null,
    };

    const req = this.editMode && this.editId
      ? this.http.put<any>(`${this.apiTaches}/${this.editId}`, body)
      : this.http.post<any>(this.apiTaches, body);

    req.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: e => { this.errorMsg = e.error?.message || `Erreur ${e.status}`; this.saving = false; }
    });
  }

  changerStatut(t: Tache, statut: string): void {
    this.http.put<any>(`${this.apiTaches}/${t.id}/statut`, null, {
      params: { statut }
    }).subscribe({
      next: () => t.statut = statut as any,
      error: () => t.statut = statut as any
    });
  }

  get f() { return this.form.controls; }
}
