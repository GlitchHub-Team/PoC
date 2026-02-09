import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URL base delle API, configurato nell'environment
  private apiUrl = environment.apiUrl;
  
  // Iniezione delle dipendenze 
  private http = inject(HttpClient);
  private router = inject(Router);

  // === SIGNALS PRIVATI (stato interno modificabile) ===

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // === SIGNALS PUBBLICI IN SOLA LETTURA ===
  // Esposti ai componenti per la sottoscrizione reattiva
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();

  // === COMPUTED SIGNALS ===
  // Valori derivati che si aggiornano automaticamente
  
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly userName = computed(() => this.currentUserSignal()?.username ?? '');
  readonly userTenant = computed(() => this.currentUserSignal()?.tenant ?? null);
  readonly tenantName = computed(() => this.currentUserSignal()?.tenant?.name ?? 'Nessun Tenant');

  constructor() {
    // All'avvio del servizio, tenta di ripristinare la sessione da localStorage
    this.loadFromStorage();

    // Effect reattivo: sincronizza automaticamente lo stato con localStorage
    effect(() => {
      const token = this.tokenSignal();
      const user = this.currentUserSignal();

      // Salva in localStorage solo se entrambi i valori sono presenti
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    });
  }

  /**
   * Ripristina la sessione utente dal localStorage al caricamento dell'app.
   * Verifica che il token non sia scaduto prima di ripristinare la sessione.
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;

        // Verifica la validità temporale del token JWT
        if (this.isTokenValid(token)) {
          // Token valido: ripristina la sessione
          this.tokenSignal.set(token);
          this.currentUserSignal.set(user);
        } else {
          // Token scaduto: pulisce i dati obsoleti
          this.clearStorage();
        }
      } catch {
        // Errore nel parsing JSON: dati corrotti, pulizia necessaria
        this.clearStorage();
      }
    }
  }

  /**
   * Verifica se un token JWT è ancora valido controllando il campo 'exp' (expiration).
   * Decodifica il payload del token (parte centrale in Base64) senza verificare la firma.
   * 
   * @param token - Token JWT da validare
   * @returns true se il token non è scaduto, false altrimenti
   */
  private isTokenValid(token: string): boolean {
    try {
      // Il JWT è composto da 3 parti separate da '.': header.payload.signature
      // Decodifica il payload da Base64
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Confronta la scadenza con il timestamp attuale
      const isValid = payload.exp > Math.floor(Date.now() / 1000);
      return isValid;
    } catch {
      // Qualsiasi errore di parsing indica un token malformato
      return false;
    }
  }

  /**
   * Rimuove tutti i dati di autenticazione dal localStorage.
   * Chiamato durante il logout o quando il token risulta invalido.
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Effettua il login dell'utente con le credenziali fornite.
   * In caso di successo, aggiorna automaticamente lo stato interno
   * che a sua volta triggera l'effect per la persistenza in localStorage.
   * 
   * @param request - Oggetto contenente username/email e password
   * @returns Observable con la risposta di autenticazione (token + dati utente)
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.tokenSignal.set(response.token);
        this.currentUserSignal.set(response.user);
      }),
    );
  }

  /**
   * Registra un nuovo utente nel sistema.
   * Funziona come il login: in caso di successo l'utente viene
   * automaticamente autenticato senza necessità di login separato.
   * 
   * @param request - Dati di registrazione (username, email, password, tenant, ecc.)
   * @returns Observable con la risposta di autenticazione (token + dati utente)
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => {
        this.tokenSignal.set(response.token);
        this.currentUserSignal.set(response.user);
      }),
    );
  }

  /**
   * Aggiorna i dati del profilo utente dal backend.
   * Utile quando i dati potrebbero essere cambiati lato server
   * (es. modifica profilo, cambio permessi, aggiornamento tenant).
   * 
   * @returns Observable con i dati aggiornati dell'utente
   */
  refreshProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
    );
  }

  /**
   * Effettua il logout dell'utente.
   * Resetta completamente lo stato di autenticazione e
   * reindirizza alla pagina di login.
   */
  logout(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Getter per il token JWT corrente.
   * Utilizzato principalmente dall'interceptor HTTP per
   * aggiungere l'header Authorization alle richieste API.
   * 
   * @returns Token JWT o null se non autenticato
   */
  getToken(): string | null {
    const token = this.tokenSignal();
    return token;
  }
}