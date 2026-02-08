import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  // Services (private)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  // Signals dal TenantService (esposti nel template)
  protected tenants = this.tenantService.tenants;
  protected isLoadingTenants = this.tenantService.isLoading;
  protected tenantError = this.tenantService.error;
  protected hasTenants = this.tenantService.hasTenants;

  // Signals locali per UI state
  protected isSubmitting = signal(false);
  protected submitError = signal<string | null>(null);

  // Form
  registerForm: FormGroup = this.fb.group(
    {
      TenantID: ['', [Validators.required]],
      Username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit(): void {
    // Carica tenant se non già caricati
    if (!this.hasTenants()) {
      this.tenantService.loadTenants().subscribe();
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('Password');
    const confirmPassword = control.get('ConfirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    // Escludi ConfirmPassword dalla request
    const { ConfirmPassword, ...registerData } = this.registerForm.value;
    registerData.TenantID = Number(registerData.TenantID);

    // Ok -> dashboard / Error -> mostra msg di errore
    this.authService.register(registerData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.error?.error || 'Registration failed. Please try again.');
      },
    });
  }

  retryLoadTenants(): void {
    this.tenantService.loadTenants().subscribe();
  }

  private markFormAsTouched(): void {
    Object.values(this.registerForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
