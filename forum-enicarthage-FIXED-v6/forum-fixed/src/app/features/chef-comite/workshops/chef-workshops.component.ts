import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-chef-workshops',
  templateUrl: './chef-workshops.component.html',
  styleUrls: ['./chef-workshops.component.scss'],  // réutiliser le même scss que coord
})
export class ChefWorkshopsComponent implements OnInit {
  workshops: any[] = [];
  comites: any[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  filter = 'TOUS';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  filters = ['TOUS', 'PROPOSE', 'VALIDE', 'REFUSE'];

  private apiWS     = `${environment.apiUrl}/workshops`;
  private apiComite = `${environment.apiUrl}/comites`;

  form: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      titre:       ['', Validators.required],
      description: ['', Validators.required],
      intervenant: ['', Validators.required],
      dateHeure:   ['', Validators.required],
      comiteId:    [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadComites();
  }

  // Chef ne voit que ses workshops (filtrés côté backend par son comité)
  load(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiWS}/mes-workshops`).subscribe({
      next: w  => { this.workshops = w; this.loading = false; },
      error: () => { this.workshops = []; this.loading = false; }
    });
  }

  loadComites(): void {
    // Le chef ne voit que son comité
    this.http.get<any>(`${this.apiComite}/mon-comite`).subscribe({
      next: c  => { this.comites = [c]; this.form.patchValue({ comiteId: c.id }); },
      error: () => {}
    });
  }

  get filtered(): any[] {
    return this.filter === 'TOUS'
      ? this.workshops
      : this.workshops.filter(w => w.statut === this.filter);
  }

  statutCount(f: string): number {
    return f === 'TOUS'
      ? this.workshops.length
      : this.workshops.filter(w => w.statut === f).length;
  }

  openCreate(): void {
    this.editMode = false;
    this.editId = null;
    this.errorMsg = '';
    // Pré-remplir le comité du chef (un seul comité disponible)
    const comiteId = this.comites[0]?.id ?? null;
    this.form.reset({ comiteId });
    this.showModal = true;
  }

  // Le chef peut modifier UNIQUEMENT ses workshops encore à l'état PROPOSE
  openEdit(w: any): void {
    if (w.statut !== 'PROPOSE') return; // sécurité UI
    this.editMode = true;
    this.editId = w.id;
    this.errorMsg = '';
    this.form.patchValue({
      titre:       w.titre,
      description: w.description,
      intervenant: w.intervenant,
      dateHeure:   w.dateHeure?.substring(0, 16),
      comiteId:    w.comite?.id,
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMsg = '';

    const val = this.form.value;
    const body: any = {
      titre:       val.titre,
      description: val.description,
      intervenant: val.intervenant,
      dateHeure:   val.dateHeure,
      statut:      'PROPOSE',
      comite:      val.comiteId ? { id: val.comiteId } : null,
    };

    const req = this.editMode && this.editId
      ? this.http.put<any>(`${this.apiWS}/${this.editId}`, body)
      : this.http.post<any>(this.apiWS, body);

    req.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: e  => { this.errorMsg = e.error?.message || `Erreur ${e.status}`; this.saving = false; }
    });
  }

  statutIcon(s: string): string {
    return ({ PROPOSE: '🟡', VALIDE: '🟢', REFUSE: '🔴' } as any)[s] ?? '';
  }

  get f() { return this.form.controls; }
}
