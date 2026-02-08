import { User } from './user.model';

/**
 * Type custom per la response di autenticazione dal backend
 */
export interface AuthResponse {
  token: string;
  user: User;
}
