import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tenant } from '../models/tenant.model';

/**
 * Servizio per la gestione dei Tenant.
 * Utilizzato durante il login e la registrazione per mostrare
 * la lista dei tenant disponibili a cui l'utente può associarsi.
 * 
 * Implementa un pattern di caching con Angular Signals per evitare
 * chiamate API ripetute e garantire reattività nei componenti.
 */
@Injectable({
  providedIn: 'root',
})
export class TenantService {
  // URL base delle API, configurato nell'environment
  private apiUrl = environment.apiUrl;

  // === SIGNALS PRIVATI (stato interno modificabile) ===
  
  // Lista dei tenant recuperati dal backend
  private tenantsSignal = signal<Tenant[]>([]);
  // Flag per indicare se è in corso un caricamento
  private loadingSignal = signal<boolean>(false);
  // Messaggio di errore in caso di fallimento della chiamata
  private errorSignal = signal<string | null>(null);

  // === SIGNALS PUBBLICI IN SOLA LETTURA ===
  // Esposti ai componenti per la sottoscrizione reattiva
  
  readonly tenants = this.tenantsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // === COMPUTED SIGNALS ===
  // Valori derivati calcolati automaticamente quando cambiano i signals sorgente
  
  // Indica se esistono tenant nella lista
  readonly hasTenants = computed(() => this.tenantsSignal().length > 0);
  // Numero totale di tenant disponibili
  readonly tenantCount = computed(() => this.tenantsSignal().length);

  // Iniezione del client HTTP per le chiamate al backend
  constructor(private http: HttpClient) {}

  /**
   * Carica la lista dei tenant dal backend.
   * Implementa una strategia di caching: se i tenant sono già stati caricati,
   * restituisce i dati dalla cache locale invece di effettuare una nuova chiamata.
   * 
   * @returns Observable<Tenant[]> - Stream con la lista dei tenant
   */
  loadTenants(): Observable<Tenant[]> {
    // Verifica se i dati sono già presenti in cache
    // In tal caso, evita una chiamata HTTP non necessaria
    if (this.hasTenants()) {
      return new Observable((subscriber) => {
        subscriber.next(this.tenantsSignal()); // Emette i dati dalla cache
        subscriber.complete(); // Completa immediatamente lo stream
      });
    }

    // Imposta lo stato di caricamento e resetta eventuali errori precedenti
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Effettua la chiamata GET al backend per recuperare i tenant
    return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`).pipe(
      tap({
        // Callback di successo: salva i tenant nel signal e disattiva il loading
        next: (tenants) => {
          this.tenantsSignal.set(tenants);
          this.loadingSignal.set(false);
        },
        // Callback di errore: imposta il messaggio di errore e disattiva il loading
        error: (err) => {
          this.errorSignal.set('Failed to load tenants');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  /**
   * Resetta lo stato del servizio ai valori iniziali.
   * Utile principalmente per i test unitari o per forzare
   * un nuovo caricamento dei dati dal backend.
   */
  reset(): void {
    this.tenantsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  /**
   * Recupera un singolo tenant tramite il suo ID.
   * Non utilizza la cache locale, effettua sempre una chiamata al backend.
   * 
   * @param id - Identificativo univoco del tenant da recuperare
   * @returns Observable<Tenant> - Stream con i dati del tenant richiesto
   */
  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/tenants/${id}`);
  }
}