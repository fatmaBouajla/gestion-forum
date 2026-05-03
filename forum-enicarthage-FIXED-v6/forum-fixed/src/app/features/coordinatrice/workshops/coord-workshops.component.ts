import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-coord-workshops',
  templateUrl: './coord-workshops.component.html',
  styleUrls: ['./coord-workshops.component.scss'],
})
export class CoordWorkshopsComponent implements OnInit {
  workshops: any[] = [];
  comites: any[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  filter = 'TOUS';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  showRefuserModal = false;
  refuserId: number | null = null;
  form: FormGroup;
  refuserForm: FormGroup; // ✅ AJOUT
  filters = ['TOUS', 'PROPOSE', 'VALIDE', 'REFUSE'];

  private apiWS     = `${environment.apiUrl}/workshops`;
  private apiComite = `${environment.apiUrl}/comites`;

  mockData = [
    { id:1, titre:'IA & Metiers du Futur',     description:'Conference sur IA', intervenant:'Dr. Ahmed Haddad', dateHeure:'2025-04-20T09:00', statut:'PROPOSE', comite:{id:4,nom:'Programme'} },
    { id:2, titre:'Developpement Web Moderne', description:'Workshop Angular',  intervenant:'Sonia Rezgui',     dateHeure:'2025-04-20T11:00', statut:'VALIDE',  comite:{id:4,nom:'Programme'} },
    { id:3, titre:'Leadership & Management',   description:'Dev personnel',     intervenant:'Coach Karim',      dateHeure:'2025-04-20T14:00', statut:'REFUSE',  comite:{id:4,nom:'Programme'} },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      titre:       ['', Validators.required],
      description: ['', Validators.required],
      intervenant: ['', Validators.required],
      dateHeure:   ['', Validators.required],
      comiteId:    [null, Validators.required],
    });

    // ✅ AJOUT
    this.refuserForm = this.fb.group({
      commentaire: ['', Validators.required],
    });
  }

  ngOnInit(): void { this.load(); this.loadComites(); }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(this.apiWS).subscribe({
      next: w => { this.workshops = w; this.loading = false; },
      error: () => { this.workshops = this.mockData; this.loading = false; }
    });
  }

  loadComites(): void {
    this.http.get<any[]>(this.apiComite).subscribe({
      next: c => this.comites = c,
      error: () => {}
    });
  }

  get filtered(): any[] {
    return this.filter === 'TOUS' ? this.workshops : this.workshops.filter(w => w.statut === this.filter);
  }

  statutCount(f: string): number {
    return f === 'TOUS' ? this.workshops.length : this.workshops.filter(w => w.statut === f).length;
  }

  openCreate(): void {
    this.editMode = false; this.editId = null; this.errorMsg = '';
    this.form.reset();
    this.showModal = true;
  }

  openEdit(w: any): void {
    this.editMode = true; this.editId = w.id; this.errorMsg = '';
    this.form.patchValue({
      titre: w.titre, description: w.description, intervenant: w.intervenant,
      dateHeure: w.dateHeure?.substring(0, 16),
      comiteId: w.comite?.id
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = '';

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
      error: e => { this.errorMsg = e.error?.message || `Erreur ${e.status}`; this.saving = false; }
    });
  }

  valider(id: number): void {
    this.http.put<any>(`${this.apiWS}/${id}/valider`, {}).subscribe({
      next: () => { const w = this.workshops.find(x => x.id === id); if (w) w.statut = 'VALIDE'; },
      error: e => alert('Erreur: ' + (e.error?.message || e.status))
    });
  }

  openRefuser(id: number): void {
    this.refuserId = id;
    this.refuserForm.reset(); // ✅ reset à chaque ouverture
    this.showRefuserModal = true;
  }

  doRefuser(): void {
    if (this.refuserForm.invalid) { this.refuserForm.markAllAsTouched(); return; } // ✅
    this.http.put<any>(`${this.apiWS}/${this.refuserId}/refuser`, {}).subscribe({
      next: () => {
        const w = this.workshops.find(x => x.id === this.refuserId);
        if (w) w.statut = 'REFUSE';
        this.showRefuserModal = false;
      },
      error: () => {
        const w = this.workshops.find(x => x.id === this.refuserId);
        if (w) w.statut = 'REFUSE';
        this.showRefuserModal = false;
      }
    });
  }

  statutIcon(s: string): string {
    return { PROPOSE:'🟡', VALIDE:'🟢', REFUSE:'🔴' }[s] ?? '';
  }

  get f()  { return this.form.controls; }
  get rf() { return this.refuserForm.controls; } // ✅ AJOUT
}
