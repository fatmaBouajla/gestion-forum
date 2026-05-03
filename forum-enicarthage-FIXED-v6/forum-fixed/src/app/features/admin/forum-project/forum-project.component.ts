import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ForumProject } from '../../../core/models';

@Component({
  selector: 'app-forum-project',
  templateUrl: './forum-project.component.html',
  styleUrls: ['./forum-project.component.scss'],
})
export class ForumProjectComponent implements OnInit {
  projects: ForumProject[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  /** Statut existant en édition (le backend le conserve ; ne pas forcer PLANIFICATION). */
  private statutEdition: ForumProject['statut'] = 'PLANIFICATION';
  confirmCloture = false;
  clotureId: number | null = null;
  form: FormGroup;

  private api = `${environment.apiUrl}/forum-projects`;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nom:           ['', Validators.required],
      edition:       ['', Validators.required],
      dateDebut:     ['', Validators.required],
      dateEvenement: ['', Validators.required],
      lieu:          ['', Validators.required],
      description:   [''],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<ForumProject[]>(this.api).subscribe({
      next: p => { this.projects = p; this.loading = false; },
      error: () => {
        this.projects = [
          { id:1, nom:"Forum d'Entreprise ENICarthage 2025", edition:'2025', dateDebut:'2025-01-15', dateEvenement:'2025-04-20', lieu:'ENICarthage, Ariana', description:'Forum annuel', statut:'EN_COURS' },
        ];
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editMode = false; this.editId = null; this.errorMsg = '';
    this.form.reset();
    this.showModal = true;
  }

  openEdit(p: ForumProject): void {
    this.editMode = true; this.editId = p.id; this.errorMsg = '';
    this.statutEdition = p.statut;
    this.form.patchValue({
      nom: p.nom, edition: p.edition,
      dateDebut: p.dateDebut, dateEvenement: p.dateEvenement,
      lieu: p.lieu, description: p.description
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = '';

    const val = this.form.value;
    // IMPORTANT: le backend attend statut à la création → PLANIFICATION par défaut
    const body = {
      nom:           val.nom,
      edition:       val.edition,
      dateDebut:     val.dateDebut,     // format YYYY-MM-DD (input date)
      dateEvenement: val.dateEvenement, // format YYYY-MM-DD
      lieu:          val.lieu,
      description:   val.description || '',
      statut:        this.editMode ? this.statutEdition : 'PLANIFICATION',
    };

    const req = this.editMode && this.editId
      ? this.http.put<ForumProject>(`${this.api}/${this.editId}`, body)
      : this.http.post<ForumProject>(this.api, body);

    req.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: e => {
        this.errorMsg = e.error?.message || `Erreur ${e.status} — vérifiez que le backend est lancé`;
        this.saving = false;
      }
    });
  }

  askCloturer(id: number): void { this.clotureId = id; this.confirmCloture = true; }

  doCloturer(): void {
    // Backend utilise PATCH /{id}/archiver (pas /cloturer)
    this.http.patch<ForumProject>(`${this.api}/${this.clotureId}/archiver`, {}).subscribe({
      next: () => { this.confirmCloture = false; this.load(); },
      error: () => { this.confirmCloture = false; this.load(); }
    });
  }

  statutColor(s: string): string {
    return { PLANIFICATION:'planif', EN_COURS:'encours', CLOTURE:'cloture' }[s] ?? '';
  }

  get f() { return this.form.controls; }
}
