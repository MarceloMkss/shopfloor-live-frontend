import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { ProductionKpi } from '../models/kpi/kpi.model';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class KpiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;

   getProductionKpis(from: string, to: string): Observable<ProductionKpi> {
    return this.http.get<ProductionKpi>(`${this.base}/kpi/production`, {
      params: { from, to }
    });
  }
}