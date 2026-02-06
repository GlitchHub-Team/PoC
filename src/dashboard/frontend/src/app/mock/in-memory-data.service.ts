import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Tenant } from '../models/tenant.model';

// Interfaces
interface LoginRequest {
  Username: string;
  Password: string;
  TenantID: number;
}

interface RegisterRequest {
  Username: string;
  Password: string;
  TenantID: number;
}

interface TokenPayload {
  UserID: number;
  Username: string;
  TenantID: number;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  private tenants = [
    {
      id: 1,
      natsId: 'nats-hospital-001',
      name: 'City General Hospital',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      natsId: 'nats-clinic-002',
      name: 'HealthFirst Clinic',
      createdAt: '2024-01-05T10:30:00Z',
      updatedAt: '2024-01-05T10:30:00Z'
    },
    {
      id: 3,
      natsId: 'nats-research-003',
      name: 'BioMed Research Lab',
      createdAt: '2024-01-10T14:45:00Z',
      updatedAt: '2024-01-10T14:45:00Z'
    }
  ];

  private users: Array<User & { password: string }> = [];

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    this.users = [
      {
        id: 1,
        tenantId: 1,
        tenant: this.findTenant(1),
        username: 'dr.smith',
        password: 'password123',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        tenantId: 1,
        tenant: this.findTenant(1),
        username: 'nurse.jones',
        password: 'password123',
        createdAt: '2024-01-16T08:00:00Z',
        updatedAt: '2024-01-16T08:00:00Z'
      },
      {
        id: 3,
        tenantId: 1,
        tenant: this.findTenant(1),
        username: 'admin',
        password: 'admin123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        tenantId: 2,
        tenant: this.findTenant(2),
        username: 'dr.wilson',
        password: 'password123',
        createdAt: '2024-02-20T14:45:00Z',
        updatedAt: '2024-02-20T14:45:00Z'
      },
      {
        id: 5,
        tenantId: 2,
        tenant: this.findTenant(2),
        username: 'admin',
        password: 'admin123',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z'
      },
      {
        id: 6,
        tenantId: 3,
        tenant: this.findTenant(3),
        username: 'researcher.lee',
        password: 'password123',
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-01T08:00:00Z'
      },
      {
        id: 7,
        tenantId: 3,
        tenant: this.findTenant(3),
        username: 'admin',
        password: 'admin123',
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      }
    ];
  }

  private findTenant(id: number): Tenant {
    const tenant = this.tenants.find(t => t.id === id);
    if (!tenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }
    return { ...tenant };
  }

  createDb() {
    return {
      tenants: this.tenants,
      users: this.users,
    };
  }

  // ============================================
  // REQUEST HANDLERS
  // ============================================

  post(reqInfo: RequestInfo): Observable<any> | undefined {
    if (reqInfo.collectionName === 'login' || reqInfo.collectionName === 'register') {
      return this.handleAuthRequest(reqInfo);
    }
    return undefined;
  }

  get(reqInfo: RequestInfo): Observable<any> | undefined {
    if (reqInfo.collectionName === 'tenants') {
      return this.handleGetTenants(reqInfo);
    }
    if (reqInfo.collectionName === 'profile') {
      return this.handleGetProfile(reqInfo);
    }
    return undefined;
  }

  // ============================================
  // AUTH HANDLERS
  // ============================================

  private handleAuthRequest(reqInfo: RequestInfo): Observable<any> {
    return reqInfo.utils.createResponse$(() => {
      const url = reqInfo.url;
      const body = reqInfo.utils.getJsonBody(reqInfo.req);

      if (url.endsWith('/login')) {
        return this.handleLogin(body);
      } else if (url.endsWith('/register')) {
        return this.handleRegister(body);
      }

      return this.createErrorResponse(STATUS.NOT_FOUND, 'Endpoint not found');
    });
  }

  private handleLogin(body: LoginRequest): ResponseOptions {
    const { Username, Password, TenantID } = body;

    const tenant = this.tenants.find(t => t.id === TenantID);
    if (!tenant) {
      return this.createErrorResponse(STATUS.BAD_REQUEST, 'Invalid tenant');
    }

    const user = this.users.find(
      u => u.username === Username && u.tenantId === TenantID
    );

    if (!user || user.password !== Password) {
      return this.createErrorResponse(STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const token = this.generateMockToken(user);
    const userResponse = this.sanitizeUser(user);

    return {
      status: STATUS.OK,
      body: { token, user: userResponse }
    };
  }

  private handleRegister(body: RegisterRequest): ResponseOptions {
    const { Username, Password, TenantID } = body;

    const tenant = this.tenants.find(t => t.id === TenantID);
    if (!tenant) {
      return this.createErrorResponse(STATUS.BAD_REQUEST, 'Invalid tenant');
    }

    const existingUser = this.users.find(
      u => u.username === Username && u.tenantId === TenantID
    );

    if (existingUser) {
      return this.createErrorResponse(STATUS.CONFLICT, 'Username already exists in this tenant');
    }

    const now = new Date().toISOString();
    const newUser: User & { password: string } = {
      id: this.generateNextUserId(),
      tenantId: TenantID,
      tenant: { ...tenant },
      username: Username,
      password: Password,
      createdAt: now,
      updatedAt: now
    };

    this.users.push(newUser);

    const token = this.generateMockToken(newUser);
    const userResponse = this.sanitizeUser(newUser);

    return {
      status: STATUS.CREATED,
      body: { token, user: userResponse }
    };
  }

  // ============================================
  // TENANT HANDLERS
  // ============================================

  private handleGetTenants(reqInfo: RequestInfo): Observable<any> {
    return reqInfo.utils.createResponse$(() => {
      const id = reqInfo.id;

      if (id) {
        const tenant = this.tenants.find(t => t.id === Number(id));
        if (!tenant) {
          return this.createErrorResponse(STATUS.NOT_FOUND, 'Tenant not found');
        }
        return { status: STATUS.OK, body: { ...tenant } };
      }

      return { status: STATUS.OK, body: [...this.tenants] };
    });
  }

  // ============================================
  // PROFILE HANDLER
  // ============================================

  private handleGetProfile(reqInfo: RequestInfo): Observable<any> {
    return reqInfo.utils.createResponse$(() => {
      const payload = this.extractTokenPayload(reqInfo);

      if (!payload) {
        return this.createErrorResponse(STATUS.UNAUTHORIZED, 'Invalid token');
      }

      const user = this.users.find(u => u.id === payload.UserID);

      if (!user) {
        return this.createErrorResponse(STATUS.NOT_FOUND, 'User not found');
      }

      return { status: STATUS.OK, body: this.sanitizeUser(user) };
    });
  }

  // ============================================
  // TOKEN EXTRACTION - FIXED!
  // ============================================

  private extractTokenPayload(reqInfo: RequestInfo): TokenPayload | null {
    let authHeader: string | null = null;

    // L'header è nel req object
    try {
      const req = reqInfo.req as any;
      
      // Metodo 1: headers come HttpHeaders
      if (req && req.headers && typeof req.headers.get === 'function') {
        authHeader = req.headers.get('Authorization');
      }
      
      // Metodo 2: headers come oggetto semplice
      if (!authHeader && req && req.headers && req.headers.Authorization) {
        authHeader = req.headers.Authorization;
      }

      // Metodo 3: headers in reqInfo
      if (!authHeader && reqInfo.headers && typeof reqInfo.headers.get === 'function') {
        authHeader = reqInfo.headers.get('Authorization');
      }

      // Metodo 4: prova ad accedere direttamente
      if (!authHeader) {
        const headers = (reqInfo as any).headers;
        if (headers) {
          authHeader = headers.get ? headers.get('Authorization') : headers['Authorization'];
        }
      }

    } catch (e) {
      console.error('Error extracting auth header:', e);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return this.decodeToken(token);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generateNextUserId(): number {
    return Math.max(...this.users.map(u => u.id), 0) + 1;
  }

  private generateMockToken(user: User): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: TokenPayload = {
      UserID: user.id,
      Username: user.username,
      TenantID: user.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const headerBase64 = btoa(JSON.stringify(header));
    const payloadBase64 = btoa(JSON.stringify(payload));
    const signature = btoa('mock-signature-' + user.id);

    return `${headerBase64}.${payloadBase64}.${signature}`;
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1])) as TokenPayload;

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private sanitizeUser(user: User & { Password?: string }): User {
    const { Password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  private createErrorResponse(status: number, error: string): ResponseOptions {
    return { status, body: { error } };
  }
}