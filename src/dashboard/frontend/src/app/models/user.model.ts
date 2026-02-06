import { Tenant } from "./tenant.model";

export interface User {
    id: number;
    tenantId: number;
    tenant: Tenant;
    username: string;
    password?: string; // Opzionale perchè lo escludo nella response
    createdAt: string;
    updatedAt: string;
}