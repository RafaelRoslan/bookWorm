import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

function emailsIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const email = group.get('email')?.value?.trim();
  const confirm = group.get('confirmEmail')?.value?.trim();
  if (!email || !confirm) return null;
  return email === confirm ? null : { emailsDiferentes: true };
}

function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!pass || !confirm) return null;
  return pass === confirm ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  carregando = signal(false);
  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  get f() { return this.signupForm; }
  get invalido() { return computed(() => this.signupForm.invalid || this.carregando()); }

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      // Obrigatórios (mínimo para cadastro)
      type: ['Fisica', [Validators.required]],               // 'Fisica' | 'Juridica'
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],

      // Conta (email/senha) com validadores de confirmação
      conta: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      }, { validators: [emailsIguaisValidator, senhasIguaisValidator] }),

      // Endereço (OPCIONAL – todos)
      address: this.fb.group({
        logradouro: [''],
        numero: [''],
        bairro: [''],
        complemento: [''],
        cidade: [''],
        estado: [''],
      }),

      // Dados bancários (OPCIONAL – todos)
      bankDetails: this.fb.group({
        conta: [''],
        agencia: [''],
        tipoConta: [''],      // ex.: 'corrente', 'poupança'
        titular: [''],
        cpfTitular: [''],
      }),

      // PIX (OPCIONAL – chave)
      pix: this.fb.group({
        chave: [''],
      }),

      // Aceite (recomendado exigir)
      aceitarPolitica: [false, [Validators.requiredTrue]],
    });
  }

  mostrarErroEmail(): string | null {
    const grp = this.f.get('conta')!;
    if (grp.hasError('emailsDiferentes')) return 'E-mails não coincidem.';
    const email = grp.get('email');
    if (email?.touched && email.invalid) return 'Informe um e-mail válido.';
    const confirm = grp.get('confirmEmail');
    if (confirm?.touched && confirm.invalid) return 'Confirme com um e-mail válido.';
    return null;
  }

  mostrarErroSenha(): string | null {
    const grp = this.f.get('conta')!;
    if (grp.hasError('senhasDiferentes')) return 'Senhas não coincidem.';
    const pass = grp.get('password');
    if (pass?.touched && pass.invalid) return 'A senha deve ter pelo menos 6 caracteres.';
    return null;
  }

  onSubmit(): void {
    this.erro.set(null);
    this.sucesso.set(null);

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Monta o payload de acordo com o back
    const v = this.signupForm.value;
    const payload = {
      type: v.type,
      name: v.name?.trim(),
      lastname: v.lastname?.trim(),
      email: v.conta.email?.trim(),
      password: v.conta.password,
      address: {
        logradouro: v.address.logradouro?.trim() || undefined,
        numero: v.address.numero?.trim() || undefined,
        bairro: v.address.bairro?.trim() || undefined,
        complemento: v.address.complemento?.trim() || undefined,
        cidade: v.address.cidade?.trim() || undefined,
        estado: v.address.estado?.trim() || undefined,
      },
      bankDetails: {
        conta: v.bankDetails.conta?.trim() || undefined,
        agencia: v.bankDetails.agencia?.trim() || undefined,
        tipoConta: v.bankDetails.tipoConta?.trim() || undefined,
        titular: v.bankDetails.titular?.trim() || undefined,
        cpfTitular: v.bankDetails.cpfTitular?.trim() || undefined,
      },
      pix: {
        chave: v.pix.chave?.trim() || undefined,
      }
    };

    // Remove objetos vazios (apenas por limpeza)
    if (!Object.values(payload.address).some(x => !!x)) delete (payload as any).address;
    if (!Object.values(payload.bankDetails).some(x => !!x)) delete (payload as any).bankDetails;
    if (!payload.pix?.chave) delete (payload as any).pix;

    this.carregando.set(true);
    this.userService.createUser(payload).subscribe({
  next: (res: any) => {
    this.carregando.set(false);
    this.sucesso.set(res?.message || 'Cadastro realizado com sucesso!');
    this.signupForm.reset({
      type: 'Fisica',
      aceitarPolitica: false
    });
  },
  error: (e: any) => {
    this.carregando.set(false);
    const msg = e?.error?.message || e?.error?.messagem || 'Falha ao cadastrar. Tente novamente.';
    this.erro.set(msg);
  }
});

  }
}
