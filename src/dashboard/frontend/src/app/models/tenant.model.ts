/**
 * Type custom per l'oggetto tenant
 */
export interface Tenant {
  id: number;
  natsId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
