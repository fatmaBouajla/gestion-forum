import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statut' })
export class StatutPipe implements PipeTransform {
  private map: Record<string, string> = {
    A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINEE: 'Terminée',
    EN_RETARD: 'En retard', URGENTE: 'Urgente', NORMALE: 'Normale',
    PROPOSE: 'Proposé', VALIDE: 'Validé', REFUSE: 'Refusé',
    EN_ATTENTE: 'En attente', ACCEPTE: 'Accepté',
    PLANIFICATION: 'Planification', CLOTURE: 'Clôturé', EN_COURS_PROJET: 'En cours',
    ADMIN: 'Admin', COMITE_PILOTAGE: 'Comité Pilotage',
    COORDINATRICE: 'Coordinatrice', CHEF_COMITE: 'Chef de Comité', MEMBRE: 'Membre',
  };
  transform(value: string): string { return this.map[value] ?? value; }
}
