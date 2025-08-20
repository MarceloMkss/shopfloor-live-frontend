import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, merge, startWith, debounceTime, switchMap, takeUntil, map, Observable } from 'rxjs';
import { KpiService } from '../../services/kpi.service';
import { TelemetrySocketService } from '../../services/telemetry-socket.service';
import { ProductionKpi } from '../../models/kpi/kpi.model';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private kpi = inject(KpiService);
  private socket = inject(TelemetrySocketService);

  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>(); // disparos desde el socket o botón

  form = this.fb.group({
    from: [new Date(Date.now() - 3600_000).toISOString()], // -1h
    to:   [new Date().toISOString()]
  });

  // Cambios de fechas + disparos del socket/botón
/*   data$: Observable<ProductionKpi> = merge(
    this.form.valueChanges.pipe(startWith(this.form.value)),
    this.refresh$.pipe(map(() => this.form.getRawValue()))
  ).pipe(
    debounceTime(300),
    switchMap(v => this.kpi.getProductionKpis(v!.from!, v!.to!))
  );
 */

    // refresh quando form muda + quando recebe evento de socket
  data$: Observable<ProductionKpi> = merge(
    this.form.valueChanges.pipe(startWith(this.form.value), map(() => true)),
    this.refresh$.pipe(map(() => true)),
    this.socket.stream$.pipe(map(() => true))
  ).pipe(
    switchMap(() => this.kpi.getProductionKpis(this.form.value!.from!, this.form.value!.to!))
  );

  ngOnInit(): void {
    this.socket.connect();
    // cuando llega telemetría -> refrescamos KPIs (sin tocar el form)
    this.socket.stream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh$.next());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }

  trackByMachine = (_: number, m: { machine: string }) => m.machine;
  trackByKey     = (_: number, kv: { key: string, value: number }) => kv.key;

  // si tienes botón "Actualizar" en la UI
  onRefreshClick() {
    this.refresh$.next();
  }
}
