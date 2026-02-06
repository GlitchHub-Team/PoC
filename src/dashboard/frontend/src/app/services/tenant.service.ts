import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tenant } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = environment.apiUrl;

  private tenantsSignal = signal<Tenant[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly tenants = this.tenantsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasTenants = computed(() => this.tenantsSignal().length > 0);
  readonly tenantCount = computed(() => this.tenantsSignal().length);

  constructor(private http: HttpClient) {}

  loadTenants(): Observable<Tenant[]> {
    // Se già caricati, ritorna i dati esistenti
    if (this.hasTenants()) {
      return new Observable(subscriber => {
        subscriber.next(this.tenantsSignal());
        subscriber.complete();
      });
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Recupera i dati con una call GET 
    return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`).pipe(
      tap({
        next: (tenants) => {
          this.tenantsSignal.set(tenants);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set('Failed to load tenants');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  // Reset (testing)
  reset(): void {
    this.tenantsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/tenants/${id}`);
  }
}