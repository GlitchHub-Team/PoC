import { Tenant } from './tenant.model';

/**
 * Type custom per l'oggetto utente
 */
export interface User {
  id: number;
  tenantId: number;
  tenant: Tenant;
  username: string;
  password?: string; // Opzionale perchè lo escludo nella response
  createdAt: string;
  updatedAt: string;
}
