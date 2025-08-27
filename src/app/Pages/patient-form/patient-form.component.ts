import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientsService } from '../../Services/patients.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PatientsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    date_of_birth: ['', Validators.required],
    adress: ['', Validators.required],
    phone: [''],
    medical_history: [''],
  });

  editing = false;
  id?: number;

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.editing = true;
      const patient = await this.service.getPatient(this.id);
      this.form.patchValue(patient);
    }
  }

async onSubmit() {
  if (this.form.invalid) return;

  try {
    if (this.editing && this.id) {
      await this.service.updatePatient(this.id, this.form.value as Partial<Patient>);
      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Paciente atualizado com sucesso!',
        confirmButtonColor: '#3085d6',
      });
    } else {
      await this.service.createPatient(this.form.value as Omit<Patient, 'id'>);
      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Paciente cadastrado com sucesso!',
        confirmButtonColor: '#3085d6',
      });
    }

    this.router.navigate(['/patients']);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: 'Erro ao salvar paciente.',
      confirmButtonColor: '#d33',
    });
  }
}


  cancelar() {
    this.router.navigate(['/patients']);
  }
}