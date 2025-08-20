import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, merge, startWith, debounceTime, switchMap, takeUntil, map, Observable, tap } from 'rxjs';
import { KpiService } from '../../services/kpi.service';
import { TelemetrySocketService } from '../../services/telemetry-socket.service';
import { ProductionKpi } from '../../models/kpi/kpi.model';
// ApexCharts
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexFill,
  ApexGrid,
  ApexYAxis,
  ApexLegend,
  ApexTooltip
} from 'ng-apexcharts';

type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  title?: ApexTitleSubtitle;
  fill?: ApexFill;
  grid?: ApexGrid;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
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
    switchMap(() => 
      this.kpi.getProductionKpis(this.form.value!.from!, this.form.value!.to!)
    ),
    tap(kpi => this.updateBarChart(kpi))   // <— AQUÍ actualizamos la barra
  );

  // método que mapea los datos a la serie del gráfico
  private updateBarChart(kpi: ProductionKpi) {
    const list = kpi?.productionByMachine ?? [];
    const cats = list.map(m => m.machine);
    const vals = list.map(m => m.qty);

    this.prodBarOptions.update(o => ({
      ...o,
      xaxis: { ...o.xaxis, categories: cats },
      series: [{ name: 'Qty', data: vals }]
    }));

    // DEBUG opcional
    // console.log('bar cats:', cats, 'vals:', vals);
  }

  // --- GRÁFICO 1: Barras - Producción por máquina (KPI) ---
  prodBarOptions = signal<ChartOptions>({
    series: [{ name: 'Qty', data: [] }],
    chart: { type: 'bar', height: 300, toolbar: { show: false }, background: 'transparent' },
    xaxis: { categories: [], labels: { style: { colors: '#9CA3AF' } } },
    yaxis: { labels: { style: { colors: '#9CA3AF' } } },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4, borderColor: '#273549' },
    title: { text: 'Producción por máquina', style: { color: '#E5E7EB' } },
    tooltip: {
      theme: 'dark',                              // <-- aquí
      y: { formatter: (v: number) => `${v}` },    // opcional
      marker: { show: true },
    }
  });


  // --- GRÁFICO 2: Línea - Temperatura en tiempo real (WS) ---
  private tempBuffer: { x: number; y: number }[] = []; // últimos 30 puntos
  tempLineOptions = signal<ChartOptions>({
    series: [{ name: 'Temperatura (°C)', data: [] }],
    chart: { type: 'line', height: 300, animations: { enabled: true }, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { type: 'datetime', labels: { show: true } },
    yaxis: { decimalsInFloat: 1 },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
  /*   tooltip: { x: { format: 'HH:mm:ss' } }, */
    title: { text: 'Temperatura (tiempo real)' },
    tooltip: {
      theme: 'dark',                              // <-- aquí
      y: { formatter: (v: number) => `${v}` },    // opcional
      marker: { show: true }
    }
  });

  constructor() {}

  ngOnInit(): void {

  this.socket.connect();

  // refrescar KPIs cuando llega telemetría
  this.socket.stream$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.refresh$.next());

  // alimentar la serie de temperatura
  this.socket.stream$
    .pipe(takeUntil(this.destroy$))
    .subscribe(ev => {
      if (ev?.temperature && ev?.ts) {
        this.tempBuffer.push({ x: new Date(ev.ts).getTime(), y: Number(ev.temperature) });
        if (this.tempBuffer.length > 30) this.tempBuffer.shift();
        this.tempLineOptions.update(o => ({
          ...o,
          series: [{ name: 'Temperatura (°C)', data: [...this.tempBuffer] }]
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }

  // llamado desde el template (botón)
  doRefresh(){ this.refresh$.next(); }

  // cuando llega KPI, actualizamos las barras
  onKpi(d: ProductionKpi) {
    const cats = d.productionByMachine?.map(m => m.machine) ?? [];
    const vals = d.productionByMachine?.map(m => m.qty) ?? [];
    this.prodBarOptions.update(o => ({
      ...o,
      xaxis: { ...o.xaxis, categories: cats },
      series: [{ name: 'Qty', data: vals }]
    }));
  }

  trackByMachine = (_: number, m: { machine: string }) => m.machine;
  trackByKey     = (_: number, kv: { key: string, value: number }) => kv.key;
 
}
