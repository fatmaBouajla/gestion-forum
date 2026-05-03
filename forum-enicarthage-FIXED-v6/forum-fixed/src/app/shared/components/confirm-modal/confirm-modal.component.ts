/* src/app/shared/components/confirm-modal/confirm-modal.component.ts */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="overlay" *ngIf="open" (click)="cancel.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-icon">{{ icon }}</div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="cancel.emit()">Annuler</button>
          <button class="btn-confirm" [class.danger]="danger" (click)="confirm.emit()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
    .modal{background:white;border-radius:20px;padding:32px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);}
    .modal-icon{font-size:40px;margin-bottom:14px;}
    h3{font-size:18px;font-weight:800;color:#0F172A;margin-bottom:8px;}
    p{font-size:13.5px;color:#64748B;margin-bottom:24px;line-height:1.5;}
    .modal-actions{display:flex;gap:10px;justify-content:center;}
    .btn-cancel{padding:10px 24px;border:1.5px solid #E2E8F0;border-radius:10px;background:white;cursor:pointer;font-weight:600;color:#334155;font-family:inherit;font-size:13px;transition:all .2s;&:hover{background:#F8FAFC;}}
    .btn-confirm{padding:10px 24px;border:none;border-radius:10px;background:#1E40AF;color:white;cursor:pointer;font-weight:700;font-family:inherit;font-size:13px;transition:all .2s;&.danger{background:#EF4444;}&:hover{opacity:.9;}}
  `]
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmer';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() icon = '❓';
  @Input() danger = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
