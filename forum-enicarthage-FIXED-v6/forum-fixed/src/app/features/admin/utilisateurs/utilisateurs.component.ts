import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss'],
})
export class UtilisateursComponent implements OnInit {
  users: User[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  showModal = false;
  editMode = false;
  editId: number | null = null;
  search = '';
  filterRole = '';
  confirmDelete = false;
  deleteId: number | null = null;
  form: FormGroup;

  roles: { value: Role; label: string }[] = [
    { value: 'ADMIN',           label: 'Admin' },
    { value: 'COMITE_PILOTAGE', label: 'Comité Pilotage' },
    { value: 'COORDINATRICE',   label: 'Coordinatrice' },
    { value: 'CHEF_COMITE',     label: 'Chef de Comité' },
    { value: 'MEMBRE',          label: 'Membre' },
  ];

  private api = `${environment.apiUrl}/utilisateurs`;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nom:        ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      motDePasse: [''],
      role:       ['MEMBRE', Validators.required],
      actif:      [true],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<User[]>(this.api).subscribe({
      next: data => { this.users = data; this.loading = false; },
      error: () => {
        // Données mock si backend hors ligne
        this.users = [
          { id:1, nom:'Fatma Bouajla',  email:'admin@forum.tn',    role:'ADMIN',           actif:true },
          { id:2, nom:'Mayssa Abdouli', email:'pilotage@forum.tn', role:'COMITE_PILOTAGE', actif:true },
          { id:3, nom:'Rawen Zgarni',   email:'chef@forum.tn',     role:'CHEF_COMITE',     actif:true },
          { id:4, nom:'Ali Mansour',    email:'membre@forum.tn',   role:'MEMBRE',          actif:true },
        ];
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editMode = false;
    this.editId = null;
    this.errorMsg = '';
    this.form.reset({ role: 'MEMBRE', actif: true });
    // Mot de passe obligatoire à la création
    this.form.get('motDePasse')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('motDePasse')?.updateValueAndValidity();
    this.showModal = true;
  }

  openEdit(u: User): void {
    this.editMode = true;
    this.editId = u.id;
    this.errorMsg = '';
    this.form.patchValue({ nom: u.nom, email: u.email, role: u.role, actif: u.actif, motDePasse: '' });
    // Mot de passe optionnel à la modification
    this.form.get('motDePasse')?.clearValidators();
    this.form.get('motDePasse')?.updateValueAndValidity();
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMsg = '';

    const val = this.form.value;

    if (this.editMode && this.editId) {
      // PUT /api/utilisateurs/{id} — body: Utilisateur complet
      const body: any = { nom: val.nom, email: val.email, role: val.role, actif: val.actif };
      if (val.motDePasse) body.motDePasse = val.motDePasse;

      this.http.put<User>(`${this.api}/${this.editId}`, body).subscribe({
        next: () => { this.showModal = false; this.saving = false; this.load(); },
        error: e => { this.errorMsg = e.error?.message || 'Erreur lors de la modification'; this.saving = false; },
      });
    } else {
      // POST /api/utilisateurs — body: Utilisateur avec motDePasse en clair
      // Le backend encode lui-même avec BCrypt
      const body = { nom: val.nom, email: val.email, motDePasse: val.motDePasse, role: val.role, actif: val.actif };

      this.http.post<User>(this.api, body).subscribe({
        next: () => { this.showModal = false; this.saving = false; this.load(); },
        error: e => { this.errorMsg = e.error?.message || 'Erreur lors de la création'; this.saving = false; },
      });
    }
  }

  confirmDeleteUser(id: number): void { this.deleteId = id; this.confirmDelete = true; }

  doDelete(): void {
    this.http.delete(`${this.api}/${this.deleteId}`).subscribe({
      next: () => { this.confirmDelete = false; this.load(); },
      error: () => { this.confirmDelete = false; this.load(); }
    });
  }

  toggleActif(u: User): void {
    this.http.patch<User>(`${this.api}/${u.id}/activer?actif=${!u.actif}`, {}).subscribe({
      next: () => { u.actif = !u.actif; },
      error: () => {}
    });
  }

  get filtered(): User[] {
    return this.users.filter(u =>
      (!this.search ||
        u.nom.toLowerCase().includes(this.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.search.toLowerCase())) &&
      (!this.filterRole || u.role === this.filterRole)
    );
  }

  get f() { return this.form.controls; }

  roleLabel(r: string): string { return this.roles.find(x => x.value === r)?.label ?? r; }
  initials(nom: string): string { return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
}
