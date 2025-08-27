import { Component, OnInit } from '@angular/core';
import { Patient, PatientsService } from '../../Services/patients.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  perPageOptions = [10, 20, 50];
  perPage = this.perPageOptions[0];
  page = 1;
  totalPages = 1;
  total = 0;

  patient: Patient[] = [];
  loading = false;
  error: string | null = null;
  appliedQ = '';

  private ctrl: AbortController | null = null;

  constructor(private patientService: PatientsService) { }

  ngOnInit(): void {
    this.fetchPatient();
  }

  async fetchPatient() {
    try {
      this.loading = true;
      this.error = null;

      this.ctrl?.abort();
      this.ctrl = new AbortController();

      const resp = await this.patientService.getPatients(
        {
          q: this.appliedQ,
          page: this.page,
          perPage: this.perPage,
          orderBy: 'name',
          orderDir: 'asc',
        },
        this.ctrl.signal
      );

      this.patient = resp.data;
      this.total = resp.total;
      this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.perPage));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Erro ao trazer pacientes.', err);
      this.error = 'Erro ao carregar clientes. Por favor, tente mais tarde.';
    } finally {
      this.loading = false;
    }
  }

  async deletePatient(id: number) {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await this.patientService.deletePatient(id);

      await Swal.fire({
        icon: 'success',
        title: 'Excluído!',
        text: 'Paciente removido com sucesso.',
        confirmButtonColor: '#3085d6',
      });

      if (this.patient.length === 1 && this.page > 1) this.page--;
      this.fetchPatient();
    } catch (err) {
      console.error('Erro ao excluir paciente', err);
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Erro ao excluir paciente.',
        confirmButtonColor: '#d33',
      });
    }
  }


  goToPage(page: number) {
    const safe = Math.min(Math.max(1, page), this.totalPages);
    if (safe !== this.page) {
      this.page = safe;
      this.fetchPatient();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchPatient();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchPatient();
    }
  }

  firstPage() {
    if (this.page !== 1) {
      this.page = 1;
      this.fetchPatient();
    }
  }

  lastPage() {
    if (this.page !== this.totalPages) {
      this.page = this.totalPages;
      this.fetchPatient();
    }
  }

  onChangePerPage(per: number) {
    this.perPage = per;
    this.page = 1;
    this.fetchPatient();
  }


  get startItem(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.perPage + 1;
  }

  get endItem(): number {
    return Math.min(this.page * this.perPage, this.total);
  }
}