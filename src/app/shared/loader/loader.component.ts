import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/service/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="loader" *ngIf="active()">
    <div class="bar"></div>
  </div>`,
  styles: [`
  .loader{ position: fixed; top:0; left:0; right:0; height:3px; z-index:9999; }
  .bar{ width:100%; height:100%; background:#22d3ee;
        animation: shimmer 1.2s linear infinite; }
  @keyframes shimmer { 0%{transform: translateX(-100%);} 100%{transform: translateX(100%);} }
  `]
})
export class LoaderComponent {
  get active() {
    return this.loading.active;
  }
  constructor(private loading: LoadingService) {}
}
