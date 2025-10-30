// src/app/pages/login/login.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  error = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submit(): void {
  if (this.form.invalid || this.loading) return;
  this.loading = true;
  this.error = '';

  this.auth.onLogin(this.form.value as { email: string; password: string }).subscribe({
    next: () => {
      this.loading = false;
      this.router.navigate(['']);
    },
    error: (e) => {
      console.error('LOGIN ERROR', e);
      this.error = e?.error?.message || e?.message || 'Credenciais inválidas';
      this.loading = false;
    }
  });
}
}
