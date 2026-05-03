/* src/app/shared/components/stat-card/stat-card.component.ts */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card" [ngClass]="color">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-body">
        <div class="stat-val">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div class="stat-sub" *ngIf="sub">{{ sub }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card { background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s;
      &:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.08);}
    }
    .stat-icon{font-size:28px;width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .blue  .stat-icon{background:#DBEAFE;}
    .green .stat-icon{background:#D1FAE5;}
    .red   .stat-icon{background:#FEE2E2;}
    .amber .stat-icon{background:#FEF3C7;}
    .stat-val{font-size:26px;font-weight:800;color:#0F172A;line-height:1;}
    .stat-label{font-size:12px;font-weight:600;color:#64748B;margin-top:3px;}
    .stat-sub{font-size:11px;color:#94A3B8;margin-top:2px;}
  `]
})
export class StatCardComponent {
  @Input() icon = '';
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() sub = '';
  @Input() color: 'blue' | 'green' | 'red' | 'amber' = 'blue';
}
