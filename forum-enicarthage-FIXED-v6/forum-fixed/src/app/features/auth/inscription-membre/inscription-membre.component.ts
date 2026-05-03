import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inscription-membre',
  templateUrl: './inscription-membre.component.html',
  styleUrls: ['./inscription-membre.component.scss'],
})
export class InscriptionMembreComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  success = false;
  cvFile: File | null = null;
  cvError = '';

  comites = ['Sponsoring', 'Design', 'Logistique', 'Projet', 'Programme', 'Média'];
  niveaux = [
    { value: '1', label: '1ère année' },
    { value: '2', label: '2ème année' },
    { value: '3', label: '3ème année' },
    { value: '4', label: '4ème année' },
    { value: '5', label: '5ème année' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      prenom:       ['', [Validators.required, Validators.minLength(2)]],
      nom:          ['', [Validators.required, Validators.minLength(2)]],
      email:        ['', [Validators.required, Validators.email]],
      telephone:    ['', [Validators.required, Validators.pattern(/^\+216[0-9]{8}$/)]],
      niveauEtudes: ['', Validators.required],
      comiteChoix:  ['', Validators.required],
      motivation:   ['', [Validators.required, Validators.minLength(30)]],
      competences:  [''],
    });
  }

  ngOnInit(): void {
    // Vide la session sans rediriger (ex: chef qui clique le lien)
    this.auth.clearSession();

    // Pré-remplir email et comité depuis les query params du lien email
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
      }
      if (params['comite']) {
        this.form.patchValue({ comiteChoix: params['comite'] });
      }
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
    fd.append('prenom',       this.form.value.prenom);
    fd.append('nom',          this.form.value.nom);
    fd.append('email',        this.form.value.email);
    fd.append('telephone',    this.form.value.telephone);
    fd.append('niveauEtudes', this.form.value.niveauEtudes);
    fd.append('comiteChoix',  this.form.value.comiteChoix);
    fd.append('motivation',   this.form.value.motivation);
    fd.append('competences',  this.form.value.competences || '');
    fd.append('posteVise',    'MEMBRE');
    fd.append('cv',           this.cvFile, this.cvFile.name);

    this.http.post(`${environment.apiUrl}/candidatures`, fd).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (e) => {
        this.error = e.error?.message || 'Erreur lors de l\'envoi.';
        this.loading = false;
      },
    });
  }

  get f() { return this.form.controls; }
}
