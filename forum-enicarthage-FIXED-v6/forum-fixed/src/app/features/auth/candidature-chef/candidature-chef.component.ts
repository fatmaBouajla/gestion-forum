import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-candidature-chef',
  templateUrl: './candidature-chef.component.html',
  styleUrls: ['./candidature-chef.component.scss'],
})
export class CandidatureChefComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = false;
  cvFile: File | null = null;
  cvError = '';

  comites = [
    'Sponsoring', 'Design', 'Logistique', 'Projet', 'Programme', 'Média'
  ];

  niveaux = [
    { value: '3', label: '3ème année' },
    { value: '4', label: '4ème année' },
    { value: '5', label: '5ème année' },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      prenom:          ['', [Validators.required, Validators.minLength(2)]],
      nom:             ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      telephone:       ['', [Validators.required, Validators.pattern(/^\+216[0-9]{8}$/)]],
      niveauEtudes:    ['', Validators.required],
      comiteSouhaite:  ['', Validators.required],
      motivation:      ['', [Validators.required, Validators.minLength(50)]],
      experience:      [''],
    });
  }

  onCvChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.cvError = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.cvError = 'Le CV doit être au format PDF.'; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.cvError = 'Le CV ne doit pas dépasser 5 Mo.'; return;
    }
    this.cvFile = file;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (!this.cvFile) { this.cvError = 'Le CV est obligatoire.'; return; }

    this.loading = true; this.error = '';

    const fd = new FormData();
    fd.append('prenom',         this.form.value.prenom);
    fd.append('nom',            this.form.value.nom);
    fd.append('email',          this.form.value.email);
    fd.append('telephone',      this.form.value.telephone);
    fd.append('niveauEtudes',   this.form.value.niveauEtudes);
    fd.append('comiteSouhaite', this.form.value.comiteSouhaite);
    fd.append('motivation',     this.form.value.motivation);
    fd.append('experience',     this.form.value.experience || '');
    fd.append('posteVise',      'CHEF_COMITE');
    fd.append('cv',             this.cvFile, this.cvFile.name);

    this.http.post(`${environment.apiUrl}/candidatures`, fd).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (e) => {
        this.error = e.error?.message || 'Erreur lors de l\'envoi. Réessayez.';
        this.loading = false;
      },
    });
  }

  get f() { return this.form.controls; }
}
