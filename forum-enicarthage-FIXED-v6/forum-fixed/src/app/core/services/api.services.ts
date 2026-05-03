import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, ForumProject, Comite, Tache, Workshop,
  CandidatureCV, Notification, KPIs, AvancementComite
} from '../models';

const API = environment.apiUrl;

// ─── UTILISATEUR ──────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private url = `${API}/utilisateurs`;
  constructor(private http: HttpClient) {}

  // Backend retourne User[] directement
  getAll(): Observable<any> { return this.http.get<User[]>(this.url); }

  // Profil de l'utilisateur connecté
  getMe(): Observable<User> { return this.http.get<User>(`${this.url}/me`); }

  getById(id: number): Observable<User> { return this.http.get<User>(`${this.url}/${id}`); }

  create(u: Partial<User> & { motDePasse?: string }): Observable<User> {
    return this.http.post<User>(this.url, u);
  }
  update(id: number, u: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, u);
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  // Backend: PATCH /{id}/activer?actif=true
  toggleActif(id: number, actif: boolean): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}/activer`, null, {
      params: { actif: actif.toString() }
    });
  }
}

// ─── FORUM PROJECT ────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ForumProjectService {
  private url = `${API}/forum-projects`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<ForumProject[]> { return this.http.get<ForumProject[]>(this.url); }
  getCurrent(): Observable<ForumProject> { return this.http.get<ForumProject>(`${this.url}/current`); }
  getById(id: number): Observable<ForumProject> { return this.http.get<ForumProject>(`${this.url}/${id}`); }
  create(f: Partial<ForumProject>): Observable<ForumProject> {
    return this.http.post<ForumProject>(this.url, f);
  }
  update(id: number, f: Partial<ForumProject>): Observable<ForumProject> {
    return this.http.put<ForumProject>(`${this.url}/${id}`, f);
  }
  /** Clôture = archivage côté API Spring (PATCH /archiver). */
  cloturer(id: number): Observable<ForumProject> {
    return this.http.patch<ForumProject>(`${this.url}/${id}/archiver`, {});
  }
}

// ─── COMITE ───────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ComiteService {
  private url = `${API}/comites`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Comite[]> { return this.http.get<Comite[]>(this.url); }
  getById(id: number): Observable<Comite> { return this.http.get<Comite>(`${this.url}/${id}`); }

  // Retourne le comité dont le chef connecté est responsable
  getMonComite(): Observable<Comite> { return this.http.get<Comite>(`${this.url}/mon-comite`); }

  create(c: Partial<Comite>): Observable<Comite> { return this.http.post<Comite>(this.url, c); }
  update(id: number, c: Partial<Comite>): Observable<Comite> {
    return this.http.put<Comite>(`${this.url}/${id}`, c);
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  // Backend: POST /{id}/membres?utilisateurId=X
  ajouterMembre(comiteId: number, membreId: number): Observable<Comite> {
    return this.http.post<Comite>(`${this.url}/${comiteId}/membres`, null, {
      params: { utilisateurId: membreId.toString() }
    });
  }
  retirerMembre(comiteId: number, membreId: number): Observable<Comite> {
    return this.http.delete<Comite>(`${this.url}/${comiteId}/membres`, {
      params: { utilisateurId: membreId.toString() }
    });
  }
}

// ─── TACHE ────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class TacheService {
  private url = `${API}/taches`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.url, { params });
  }

  getMesTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.url}/mes-taches`);
  }

  /**
   * @deprecated Le backend filtre par rôle (chef → son comité). Utiliser {@link getAll}().
   */
  getByComite(comiteId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.url}`, { params: { comiteId: comiteId.toString() } });
  }

  getById(id: number): Observable<Tache> { return this.http.get<Tache>(`${this.url}/${id}`); }

  // Backend attend TacheDTO avec comiteId, membreId etc.
  create(t: Partial<Tache>): Observable<Tache> { return this.http.post<Tache>(this.url, t); }

  update(id: number, t: Partial<Tache>): Observable<Tache> {
    return this.http.put<Tache>(`${this.url}/${id}`, t);
  }

  // Backend: PUT /{id}/statut?statut=EN_COURS
  changerStatut(id: number, statut: string): Observable<Tache> {
    return this.http.put<Tache>(`${this.url}/${id}/statut`, null, {
      params: { statut }
    });
  }

  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  ajouterCommentaire(id: number, contenu: string): Observable<unknown> {
    return this.http.post(`${this.url}/${id}/commentaires`, { contenu });
  }
}

// ─── WORKSHOP ─────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class WorkshopService {
  private url = `${API}/workshops`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Workshop[]> { return this.http.get<Workshop[]>(this.url); }
  getById(id: number): Observable<Workshop> { return this.http.get<Workshop>(`${this.url}/${id}`); }
  create(w: Partial<Workshop>): Observable<Workshop> { return this.http.post<Workshop>(this.url, w); }
  update(id: number, w: Partial<Workshop>): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.url}/${id}`, w);
  }
  valider(id: number): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.url}/${id}/valider`, {});
  }
  // Backend: PUT /{id}/refuser?commentaire=X
  refuser(id: number, commentaire: string): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.url}/${id}/refuser`, null, {
      params: { commentaire }
    });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

// ─── CANDIDATURE CV ───────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CandidatureCVService {
  private url = `${API}/candidatures`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<CandidatureCV[]> { return this.http.get<CandidatureCV[]>(this.url); }
  getById(id: number): Observable<CandidatureCV> { return this.http.get<CandidatureCV>(`${this.url}/${id}`); }

  /** Dépôt public : POST /api/candidatures (multipart, même contrat que les formulaires). */
  upload(formData: FormData): Observable<CandidatureCV> {
    return this.http.post<CandidatureCV>(this.url, formData);
  }

  telechargerCv(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/telecharger-cv`, { responseType: 'blob' });
  }

  // Backend: PUT /{id}/accepter
  accepter(id: number): Observable<CandidatureCV> {
    return this.http.put<CandidatureCV>(`${this.url}/${id}/accepter`, {});
  }

  // Backend: PUT /{id}/refuser?commentaire=X
  refuser(id: number, commentaire: string): Observable<CandidatureCV> {
    return this.http.put<CandidatureCV>(`${this.url}/${id}/refuser`, null, {
      params: { commentaire }
    });
  }

  analyserIA(id: number): Observable<CandidatureCV> {
    return this.http.post<CandidatureCV>(`${this.url}/${id}/analyser-ia`, {});
  }
}

// ─── NOTIFICATION ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${API}/notifications`;
  constructor(private http: HttpClient) {}

  getMesNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/mes-notifications`);
  }
  getNonLues(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/non-lues`);
  }
  // Backend: PUT /{id}/lu
  marquerLu(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.url}/${id}/lu`, {});
  }
  marquerToutLu(): Observable<void> {
    return this.http.patch<void>(`${this.url}/tout-lu`, {});
  }
}

// ─── STATISTIQUES ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class StatistiquesService {
  private url = `${API}/stats`;
  constructor(private http: HttpClient) {}
  getKPIs(): Observable<KPIs> { return this.http.get<KPIs>(`${this.url}/kpis`); }
  getAvancementComites(): Observable<AvancementComite[]> {
    return this.http.get<AvancementComite[]>(`${this.url}/comites`);
  }
}
