import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
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
  loginForm: FormGroup = this.fb.group({
    TenantID: ['', [Validators.required]],
    Username: ['', [Validators.required]],
    Password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Carica tenant se non già caricati
    if (!this.hasTenants()) {
      this.tenantService.loadTenants().subscribe();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const loginData = {
      ...this.loginForm.value,
      TenantID: Number(this.loginForm.value.TenantID)
    };

    // Ok -> dashboard / Error -> mostra msg di errore
    this.authService.login(loginData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.error?.error || 'Login failed. Please try again.');
      }
    });
  }

  retryLoadTenants(): void {
    this.tenantService.loadTenants().subscribe();
  }

  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}