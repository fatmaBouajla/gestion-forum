import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ForumProject } from '../../../core/models';

@Component({
  selector: 'app-comites',
  templateUrl: './comites.component.html',
  styleUrls: ['./comites.component.scss'],
})
export class ComitesComponent implements OnInit {
  comites: any[] = [];
  users: any[] = [];
  projects: ForumProject[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  confirmDelete = false;
  deleteId: number | null = null;
  form: FormGroup;

  nomsComites = ['Sponsoring','Design','Logistique','Projet','Programme','Media'];

  private apiComites  = `${environment.apiUrl}/comites`;
  private apiUsers    = `${environment.apiUrl}/utilisateurs`;
  private apiProjects = `${environment.apiUrl}/forum-projects`;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nom:            ['', Validators.required],
      description:    ['', Validators.required],
      forumProjectId: [null, Validators.required],
      chefId:         [null],
    });
  }

  ngOnInit(): void { this.load(); this.loadUsers(); this.loadProjects(); }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(this.apiComites).subscribe({
      next: c => { this.comites = c; this.loading = false; },
      error: () => {
        this.comites = [
          { id:1, nom:'Design',     description:'Identite visuelle',          avancement:72, nombreTaches:38 },
          { id:2, nom:'Sponsoring', description:'Relations entreprises',      avancement:60, nombreTaches:32 },
          { id:3, nom:'Logistique', description:'Organisation materielle',    avancement:45, nombreTaches:40 },
        ];
        this.loading = false;
      },
    });
  }

  loadUsers(): void {
    this.http.get<any[]>(this.apiUsers).subscribe({
      next: (p: any) => {
        const all = Array.isArray(p) ? p : (p.content || []);
        this.users = all.filter((u: any) => u.role === 'CHEF_COMITE');
      },
      error: () => {}
    });
  }

  loadProjects(): void {
    this.http.get<ForumProject[]>(this.apiProjects).subscribe({
      next: p => this.projects = p,
      error: () => {}
    });
  }

  openCreate(): void {
    this.editMode = false; this.editId = null; this.errorMsg = '';
    this.form.reset();
    this.showModal = true;
  }

  openEdit(c: any): void {
    this.editMode = true; this.editId = c.id; this.errorMsg = '';
    this.form.patchValue({
      nom: c.nom,
      description: c.description,
      forumProjectId: c.forumProject?.id,
      chefId: c.chef?.id
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = '';

    const val = this.form.value;

    // Backend attend un objet Comite avec forumProject et chef imbriqués
    const body: any = {
      nom: val.nom,
      description: val.description,
      forumProject: val.forumProjectId ? { id: val.forumProjectId } : null,
      chef: val.chefId ? { id: val.chefId } : null,
    };

    const req = this.editMode && this.editId
      ? this.http.put<any>(`${this.apiComites}/${this.editId}`, body)
      : this.http.post<any>(this.apiComites, body);

    req.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: e => { this.errorMsg = e.error?.message || `Erreur ${e.status}`; this.saving = false; }
    });
  }

  confirmDel(id: number): void { this.deleteId = id; this.confirmDelete = true; }
  doDelete(): void {
    this.http.delete(`${this.apiComites}/${this.deleteId}`).subscribe({
      next: () => { this.confirmDelete = false; this.load(); },
      error: () => { this.confirmDelete = false; this.load(); }
    });
  }

  colorByNom(nom: string): string {
    const map: Record<string,string> = { Design:'#DBEAFE',Sponsoring:'#D1FAE5',Logistique:'#FEF3C7',Programme:'#EDE9FE',Media:'#FCE7F3',Projet:'#FEE2E2' };
    return map[nom] ?? '#F1F5F9';
  }

  iconByNom(nom: string): string {
    const map: Record<string,string> = { Design:'🎨',Sponsoring:'🤝',Logistique:'🏗',Programme:'📅',Media:'📸',Projet:'⚙' };
    return map[nom] ?? '📋';
  }

  get f() { return this.form.controls; }
}
