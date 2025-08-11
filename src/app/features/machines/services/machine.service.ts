import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Machine } from '../models/machine/machine';
import { Page } from '../models/pages/page';

@Injectable({ providedIn: 'root' })
export class MachineService {
  // Using inject to get HttpClient instance
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/machines`;

  getAll(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.base);
  }

  create(payload: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.base, payload);
  }

  getPage(status = '', page = 0, size = 10): Observable<Page<Machine>> {
    const params = { status, page, size };
    return this.http.get<Page<Machine>>(`${this.base}/page`, { params });
  }
  get(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.base}/${id}`);
  }
  put(id: number, payload: Machine): Observable<Machine> {
    return this.http.put<Machine>(`${this.base}/${id}`, payload);
  }
  patch(id: number, payload: Partial<Machine>): Observable<Machine> {
    return this.http.patch<Machine>(`${this.base}/${id}`, payload);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
