import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <div class="app-shell">
      <app-sidebar></app-sidebar>
      <div class="page-wrap">
        <app-topbar [title]="title" [subtitle]="subtitle"></app-topbar>
        <main class="page-content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; background: #F1F5F9; }
    .page-wrap { flex: 1; margin-left: 250px; display: flex; flex-direction: column; transition: margin .25s; }
    .page-content { flex: 1; padding: 24px; }
    @media (max-width: 900px) { .page-wrap { margin-left: 0; } }
  `]
})
export class LayoutComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
