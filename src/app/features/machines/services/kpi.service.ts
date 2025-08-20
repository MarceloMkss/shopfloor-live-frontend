import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environments';

import { Observable, shareReplay } from 'rxjs';

export interface ProductionKpi {
  avgTemperature: number;
  productionByMachine: { machine: string; qty: number }[];
  alarmsByCode: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class KpiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;
  private cache: Record<string, Observable<ProductionKpi>> = {};
  

   getProductionKpis1(from: string, to: string): Observable<ProductionKpi> {
    return this.http.get<ProductionKpi>(`${this.base}/kpi/production`, {
      params: { from, to }
    });
  }

  getProductionKpis(from: string, to: string) {
    const key = `${from}|${to}`;
    if (!this.cache[key]) {
      this.cache[key] = this.http
        .get<ProductionKpi>(`${this.base}/kpi/production`, { params: { from, to } })
        .pipe(shareReplay(1));
    }
    return this.cache[key];
  }

}