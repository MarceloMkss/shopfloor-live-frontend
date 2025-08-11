import { Component, inject } from '@angular/core';
import { BehaviorSubject, map, Observable, startWith, switchMap } from 'rxjs';
import { Machine } from '../../models/machine/machine';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MachineService } from '../../services/machine.service';
import { CommonModule } from '@angular/common';
import { Page } from '../../models/pages/page';

@Component({
  selector: 'app-machine-list-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './machine-list-component.html',
  styleUrl: './machine-list-component.scss'
})
export class MachineListComponent {

  private fb = inject(FormBuilder);
  private service = inject(MachineService);

   // filtro por estado + paginación
  filterForm = this.fb.group({ status: [''] });
  pageIndex = 0;
  pageSize = 10;

  private trigger$ = new BehaviorSubject<void>(undefined);

  page$ = this.trigger$.pipe(
    startWith(undefined),
    switchMap(() => this.service.getPage(
      this.filterForm.value.status ?? '',
      this.pageIndex,
      this.pageSize
    ))
  );
  // para la tabla
  rows$ = this.page$.pipe(map((p: Page<Machine>) => p.content));

  // eventos UI
  applyFilter() { this.pageIndex = 0; this.trigger$.next(); }
  nextPage() { this.pageIndex++; this.trigger$.next(); }
  prevPage() { if (this.pageIndex > 0) { this.pageIndex--; this.trigger$.next(); } }
  pageSizeChange(size: number) { this.pageSize = size; this.pageIndex = 0; this.trigger$.next(); }


  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    vendor: ['', Validators.required],
    model: ['', Validators.required],
    status: ['ACTIVE', Validators.required]
  });

  private refresh$ = new BehaviorSubject<void>(undefined);
  machines$: Observable<Machine[]> = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() => this.service.getAll())
  );

  loading = false;
  errorMsg = '';

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.service.create(this.form.value as Machine).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset({ status: 'ACTIVE' });
        this.refresh$.next();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al crear máquina';
      }
    });
  }

  get f() { return this.form.controls; }

}
