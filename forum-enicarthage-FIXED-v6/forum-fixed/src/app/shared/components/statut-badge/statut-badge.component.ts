// ─── statut-badge.component.ts ───────────────────────────────
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-statut-badge',
  template: `<span class="badge" [ngClass]="cssClass">{{ label }}</span>`,
  styles: [`
    .badge { display:inline-flex; align-items:center; padding:3px 11px; border-radius:50px; font-size:11px; font-weight:700; white-space:nowrap; }
    .a-faire    { background:#F1F5F9; color:#334155; }
    .en-cours   { background:#DBEAFE; color:#1E40AF; }
    .terminee   { background:#D1FAE5; color:#065F46; }
    .en-retard  { background:#FEE2E2; color:#991B1B; }
    .urgente    { background:#FEF3C7; color:#92400E; }
    .normale    { background:#F0F9FF; color:#075985; }
    .propose    { background:#FEF3C7; color:#92400E; }
    .valide     { background:#D1FAE5; color:#065F46; }
    .refuse     { background:#FEE2E2; color:#991B1B; }
    .en-attente { background:#F0F9FF; color:#075985; }
    .accepte    { background:#D1FAE5; color:#065F46; }
    .planif     { background:#EDE9FE; color:#5B21B6; }
    .cloture    { background:#F1F5F9; color:#475569; }
  `],
})
export class StatutBadgeComponent {
  @Input() statut = '';

  private labelMap: Record<string, string> = {
    A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINEE: 'Terminée',
    EN_RETARD: 'En retard', URGENTE: 'Urgente', NORMALE: 'Normale',
    PROPOSE: 'Proposé', VALIDE: 'Validé', REFUSE: 'Refusé',
    EN_ATTENTE: 'En attente', ACCEPTE: 'Accepté',
    PLANIFICATION: 'Planification', CLOTURE: 'Clôturé',
  };

  private cssMap: Record<string, string> = {
    A_FAIRE: 'a-faire', EN_COURS: 'en-cours', TERMINEE: 'terminee',
    EN_RETARD: 'en-retard', URGENTE: 'urgente', NORMALE: 'normale',
    PROPOSE: 'propose', VALIDE: 'valide', REFUSE: 'refuse',
    EN_ATTENTE: 'en-attente', ACCEPTE: 'accepte',
    PLANIFICATION: 'planif', CLOTURE: 'cloture',
  };

  get label(): string { return this.labelMap[this.statut] ?? this.statut; }
  get cssClass(): string { return this.cssMap[this.statut] ?? ''; }
}
