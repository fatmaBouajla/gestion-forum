import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ComiteService } from '../../../core/services/api.services';
import { Tache } from '../../../core/models';

@Component({
  selector: 'app-chef-taches',
  templateUrl: './chef-taches.component.html',
  styleUrls: ['./chef-taches.component.scss'],
})
export class ChefTachesComponent implements OnInit {
  taches: Tache[] = [];
  membres: any[] = [];
  comiteId: number | null = null;
  loading = false;
  saving = false;
  errorMsg = '';
  filterStatut = 'TOUS';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  confirmDelete = false;
  deleteId: number | null = null;
  form: FormGroup;
  statuts = ['TOUS', 'A_FAIRE', 'EN_COURS', 'TERMINEE', 'EN_RETARD'];

  private apiTaches = `${environment.apiUrl}/taches`;

  constructor(
    private comiteService: ComiteService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      titre:       ['', Validators.required],
      description: [''],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
      priorite:    ['NORMALE'],
      statut:      ['A_FAIRE'],
      membreId:    [null],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.comiteService.getMonComite().subscribe({
      next: c => {
        this.comiteId = c.id ?? null;
        // ← Charger les membres directement depuis le comité
        this.membres = (c.membres as any[]) ?? [];
        this.loadTaches();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Vous n\'êtes pas encore chef d\'un comité.';
      }
    });
  }

  loadTaches(): void {
    if (!this.comiteId) { this.loading = false; return; }
    this.http.get<Tache[]>(this.apiTaches, {
      params: { comiteId: this.comiteId.toString() }
    }).subscribe({
      next: t => { this.taches = t; this.loading = false; },
      error: () => { this.taches = []; this.loading = false; }
    });
  }

  get filtered(): Tache[] {
    return this.filterStatut === 'TOUS'
      ? this.taches
      : this.taches.filter(t => t.statut === this.filterStatut);
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
      membreId: t.membreId
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
      comiteId:    this.comiteId,
      membreId:    val.membreId || null,
    };
    const req = this.editMode && this.editId
      ? this.http.put<any>(`${this.apiTaches}/${this.editId}`, body)
      : this.http.post<any>(this.apiTaches, body);
    req.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.loadTaches(); },
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

  confirmDel(id: number): void {
    this.deleteId = id;       // ← stocker l'id D'ABORD
    this.confirmDelete = true; // ← puis ouvrir le modal
  }

  doDelete(): void {
    if (this.deleteId == null) return;  // ← garde
    const id = this.deleteId;           // ← copie locale
    this.http.delete(`${this.apiTaches}/${id}`).subscribe({
      next: () => {
        this.confirmDelete = false;
        this.deleteId = null;
        this.loadTaches();
      },
      error: (e) => {
        this.errorMsg = e.error?.message || `Erreur suppression ${e.status}`;
        this.confirmDelete = false;
        this.deleteId = null;
        this.loadTaches();
      }
    });
  }

  get f() { return this.form.controls; }
}
