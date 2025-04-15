import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit{
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      account: this.fb.group({
        nickname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      }),
      personal: this.fb.group({
        accountType: [''],
        name: ['', Validators.required],
        cpf: ['', Validators.required],
        birthDate: ['', Validators.required],
      }),
      address: this.fb.group({
        country: ['', Validators.required],
        zipCode: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        neighborhood: ['', Validators.required],
        complement: [''],
      }),
      acceptPolicy: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Form data:', this.signupForm.value);
      // Aqui você pode enviar os dados para o backend ou fazer outra lógica
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
