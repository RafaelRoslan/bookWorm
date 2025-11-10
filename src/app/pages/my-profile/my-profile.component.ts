import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { UserService } from '../../services/user.service';

/** Validador: endereço opcional, mas se começar, precisa estar completo (inclui CEP) */
function enderecoCompletoValidator(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;

  const cep         = g.get('cep')?.value?.trim();
  const logradouro  = g.get('logradouro')?.value?.trim();
  const numero      = g.get('numero')?.value?.trim();
  const bairro      = g.get('bairro')?.value?.trim();
  const cidade      = g.get('cidade')?.value?.trim();
  const estado      = g.get('estado')?.value?.trim();
  const complemento = g.get('complemento')?.value?.trim();

  // qualquer campo preenchido conta pra “comecei o endereço”
  const valores = [cep, logradouro, numero, bairro, cidade, estado, complemento];
  const preenchidos = valores.filter(v => !!v).length;

  // nada preenchido -> ok
  if (preenchidos === 0) return null;

  // obrigatórios se começou: CEP, logradouro, numero, bairro, cidade, estado
  const obrigatorios = [cep, logradouro, numero, bairro, cidade, estado];
  const obrigPreenchidos = obrigatorios.filter(v => !!v).length;

  if (obrigPreenchidos === obrigatorios.length) return null;

  return { enderecoIncompleto: true };
}

/** Validador: dados bancários opcionais, mas se começar, precisa estar completo */
function bancoCompletoValidator(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;
  const conta      = g.get('conta')?.value?.trim();
  const agencia    = g.get('agencia')?.value?.trim();
  const tipoConta  = g.get('tipoConta')?.value?.trim();
  const titular    = g.get('titular')?.value?.trim();
  const cpfTitular = g.get('cpfTitular')?.value?.trim();

  const valores = [conta, agencia, tipoConta, titular, cpfTitular];
  const preenchidos = valores.filter(v => !!v).length;

  // nada preenchido -> ok
  if (preenchidos === 0) return null;

  // todos preenchidos -> ok
  if (preenchidos === valores.length) return null;

  return { dadosBancariosIncompletos: true };
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  profileForm!: FormGroup;

  loading    = signal(false);
  carregando = signal(false);
  erro       = signal<string | null>(null);
  sucesso    = signal<string | null>(null);

  invalido = computed(() => this.profileForm?.invalid || this.carregando());

  constructor(private fb: FormBuilder, private userService: UserService) {}

  get f() { return this.profileForm; }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      type: ['Fisica', [Validators.required]],

      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],

      address: this.fb.group({
        cep: [''],             // 👈 CEP adicionado
        logradouro: [''],
        numero: [''],
        bairro: [''],
        complemento: [''],
        cidade: [''],
        estado: [''],
      }, { validators: [enderecoCompletoValidator] }),

      bankDetails: this.fb.group({
        conta: [''],
        agencia: [''],
        tipoConta: [''],
        titular: [''],
        cpfTitular: [''],
      }, { validators: [bancoCompletoValidator] }),

      pix: this.fb.group({
        chave: [''],
      }),
    });

    this.loading.set(true);

    this.userService.getMyProfile().subscribe({
      next: (res: any) => {
        const u = res.user ?? res;

        this.profileForm.patchValue({
          type: u.type ?? 'Fisica',
          name: u.name ?? '',
          lastname: u.lastname ?? '',
          address: u.address || {},
          bankDetails: u.bankDetails || {},
          pix: u.pix || {},
        });

        // nome e sobrenome aparecem, mas não podem ser alterados
        this.profileForm.get('name')?.disable({ emitEvent: false });
        this.profileForm.get('lastname')?.disable({ emitEvent: false });

        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar seus dados.');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    this.sucesso.set(null);
    this.erro.set(null);

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const v = this.profileForm.getRawValue();

    const payload: any = {
      type: v.type,
      // name/lastname não vão no payload aqui de propósito
    };

    // endereço: só manda se tiver algum campo preenchido
    const addrValues = Object.values(v.address || {});
    if (addrValues.some(val => !!(val && String(val).trim()))) {
      payload.address = v.address;
    }

    // dados bancários: só manda se tiver algum campo preenchido
    const bankValues = Object.values(v.bankDetails || {});
    if (bankValues.some(val => !!(val && String(val).trim()))) {
      payload.bankDetails = v.bankDetails;
    }

    // pix: só manda se tiver chave
    if (v.pix?.chave && String(v.pix.chave).trim()) {
      payload.pix = { chave: String(v.pix.chave).trim() };
    }

    this.carregando.set(true);
    this.userService.updateMyProfile(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set('Dados atualizados com sucesso!');
      },
      error: (e: any) => {
        this.carregando.set(false);
        const msg = e?.error?.message || e?.error?.messagem || 'Erro ao atualizar os dados.';
        this.erro.set(msg);
      }
    });
  }
}
