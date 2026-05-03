import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService } from '../../../core/services/api.services';
import { Tache } from '../../../core/models';

@Component({
  selector: 'app-membre-taches',
  templateUrl: './membre-taches.component.html',
  styleUrls: ['./membre-taches.component.scss'],
})
export class MembreTachesComponent implements OnInit {
  taches: Tache[] = [];
  loading = false;
  errorMsg = '';
  filterStatut = 'TOUS';
  showDetail = false;
  selectedTache: Tache | null = null;
  updatingStatut: number | null = null;
  submittingComment = false;
  commentForm: FormGroup;
  allFilters = ['TOUS', 'A_FAIRE', 'EN_COURS', 'TERMINEE', 'EN_RETARD'];

  constructor(private tacheService: TacheService, private fb: FormBuilder) {
    this.commentForm = this.fb.group({ contenu: ['', Validators.required] });
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMsg = '';
    this.tacheService.getMesTaches().subscribe({
      next: t => {
        // mapper comite/membre imbriqués vers les champs plats attendus par le template
        this.taches = t.map((tache: any) => ({
          ...tache,
          comiteId:   tache.comite?.id   ?? tache.comiteId,
          comiteNom:  tache.comite?.nom  ?? tache.comiteNom,
          membreId:   tache.membre?.id   ?? tache.membreId,
          membreNom:  tache.membre?.nom  ?? tache.membreNom,
          commentaires: (tache.commentaires ?? []).map((c: any) => ({
            ...c,
            auteurId:  c.auteur?.id  ?? c.auteurId,
            auteurNom: c.auteur?.nom ?? c.auteurNom ?? 'Inconnu',
          })),
        }));
        this.loading = false;
      },
      error: () => {
        this.taches = [];  // ← pas de mock
        this.errorMsg = 'Impossible de charger vos tâches.';
        this.loading = false;
      }
    });
  }

  loadTaches(): void { this.ngOnInit(); }

  get filtered(): Tache[] {
    return this.filterStatut === 'TOUS'
      ? this.taches
      : this.taches.filter(t => t.statut === this.filterStatut);
  }

  countByStatut(s: string): number {
    return s === 'TOUS' ? this.taches.length : this.taches.filter(t => t.statut === s).length;
  }

  nextStatut(current: string): string {
    const map: Record<string, string> = {
      A_FAIRE: 'EN_COURS', EN_COURS: 'TERMINEE', EN_RETARD: 'EN_COURS'
    };
    return map[current] ?? 'EN_COURS';
  }

  changerStatut(t: Tache, statut: string): void {
    this.updatingStatut = t.id;
    this.tacheService.changerStatut(t.id, statut).subscribe({
      next: () => {
        this.updatingStatut = null;
        this.loadTaches();  // ← recharge depuis le backend
      },
      error: () => {
        this.updatingStatut = null;
        this.errorMsg = 'Erreur lors du changement de statut.';
      }
    });
  }

  openDetail(t: Tache): void {
    this.selectedTache = t;
    this.showDetail = true;
    this.commentForm.reset();
  }

  addComment(): void {
    if (!this.selectedTache || this.commentForm.invalid) return;
    this.submittingComment = true;
    const contenu = this.commentForm.value.contenu;
    this.tacheService.ajouterCommentaire(this.selectedTache.id, contenu).subscribe({
      next: () => {
        this.pushComment(contenu);
        this.loadTaches();  // ← recharge pour avoir les vrais commentaires
      },
      error: () => this.pushComment(contenu)
    });
  }

  private pushComment(contenu: string): void {
    if (!this.selectedTache) return;
    if (!this.selectedTache.commentaires) this.selectedTache.commentaires = [];
    this.selectedTache.commentaires.push({
      id: Date.now(),
      contenu,
      dateCreation: new Date().toISOString(),
      auteurId: 0,
      auteurNom: 'Moi'
    });
    this.commentForm.reset();
    this.submittingComment = false;
  }
}
