/* src/app/features/chef-comite/comite/chef-comite-view.component.ts */
import { Component, OnInit } from '@angular/core';
import { ComiteService } from '../../../core/services/api.services';
import { Comite } from '../../../core/models';

@Component({
  selector: 'app-chef-comite-view',
  template: `
    <app-layout title="Mon Comité" subtitle="Détails et progression">
      <div class="card" *ngIf="comite">
        <div class="card-hd">{{ comite.nom }}</div>
        <div class="card-sub">{{ comite.description }}</div>
        <div class="detail-row"><span class="dlabel">Chef</span><span>{{ comite.chefNom }}</span></div>
        <div class="detail-row"><span class="dlabel">Membres</span><span>{{ comite.membres?.length || 0 }} membre(s)</span></div>
        <div class="detail-row"><span class="dlabel">Avancement</span>
          <div class="prog-wrap">
            <div class="prog-bar"><div class="prog-fill" [style.width.%]="comite.avancement || 0"></div></div>
            <span>{{ comite.avancement || 0 }}%</span>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`.card{background:#FFF;border:1px solid #E2E8F0;border-radius:16px;padding:24px;}.card-hd{font-size:18px;font-weight:800;color:#0F172A;font-family:'Syne',sans-serif;}.card-sub{font-size:13px;color:#64748B;margin:4px 0 20px;}.detail-row{display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #F8FAFC;&:last-child{border-bottom:none;}}.dlabel{font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;min-width:100px;}.prog-wrap{display:flex;align-items:center;gap:10px;flex:1;}.prog-bar{flex:1;height:8px;background:#F1F5F9;border-radius:4px;overflow:hidden;}.prog-fill{height:100%;background:#1E40AF;border-radius:4px;transition:width .6s;}`]
})
export class ChefComiteViewComponent implements OnInit {
  comite: Comite | null = null;
  constructor(private comiteService: ComiteService) {}
  ngOnInit(): void {
    this.comiteService.getMonComite().subscribe({
      next: c => this.comite = c,
      error: () => this.comite = { id:1, nom:'Design', description:'Identité visuelle et communication graphique du Forum', chefNom:'Rawen Zgarni', avancement:72, nombreTaches:38, membres:[] }
    });
  }
}
