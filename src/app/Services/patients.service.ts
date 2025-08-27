import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, firstValueFrom, fromEvent, takeUntil } from 'rxjs';

export interface Patient {
  id: number;
  name: string;
  date_of_birth: string;
  adress: string;
  phone?: string | null;
  medical_history?: string | null;
}

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

type OrderBy = 'id' | 'name' | 'date_of_birth' | 'phone';

type OrderDir = 'asc' | 'desc';

export function isPaginated<T>(x: unknown): x is Paginated<T> { 
  return (
    !!x &&
    typeof x === 'object' &&
    Array.isArray((x as any).data) && typeof (x as any).page == 'number'
  );
}

function toQueryParams(opts?: {
  q?: string;
  page?: number;
  perPage?: number;
  orderBy?: OrderBy;
  orderDir?: OrderDir;
}) {
  const params: Record<string, string | number> = {};
  if (!opts) return params;

  if (opts.q?.trim()) params['q'] = opts?.q.trim();
  if (typeof opts.page === 'number') params['page'] = opts.page;
  if (typeof opts.perPage === 'number') params['per_page'] = opts?.perPage;
  if (opts.orderBy) params['order_by'] = opts.orderBy;
  if (opts.orderDir) params['order_dir'] = opts.orderDir;
  return params;
}

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(private http: HttpClient) { }

  url: string = "http://127.0.0.1:8000/api/patients"

  async getPatients(
  opts?: { q?: string; page?: number; perPage?: number; orderBy?: OrderBy; orderDir?: OrderDir },
  signal?: AbortSignal
): Promise<Paginated<Patient>> {
  const request$ = this.http.get<Paginated<Patient>>(this.url, {
    params: toQueryParams(opts),
  });

  return signal
    ? firstValueFrom(request$.pipe(takeUntil(fromEvent(signal, 'abort'))))
    : firstValueFrom(request$);
}

async getPatient(id: number): Promise<Patient> {
  return firstValueFrom(this.http.get<Patient>(`${this.url}/${id}`));
}

async createPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
  return firstValueFrom(this.http.post<Patient>(this.url, data));
}

async updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
  return firstValueFrom(this.http.put<Patient>(`${this.url}/${id}`, data));
}

async deletePatient(id: number): Promise<void> {
  await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
}

}
