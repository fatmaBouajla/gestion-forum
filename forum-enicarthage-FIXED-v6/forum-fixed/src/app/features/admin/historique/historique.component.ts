import { Component } from '@angular/core';
@Component({
  selector: 'app-historique',
  template: `<app-layout title="Historique" subtitle="Archives des éditions passées du Forum">
    <div style="padding:60px;text-align:center;color:#64748B;font-size:14px;">
      📁 Sélectionnez une édition clôturée depuis <strong>Forum Projects</strong> pour voir son historique.
    </div>
  </app-layout>`
})
export class HistoriqueComponent {}
