export interface UserRepresentation {
  id?: string;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  clientRoles?: Record<string, any>;
  email?: string;
  firstName?: string;
  groups?: string[];
  lastName?: string;
  realmRoles?: string[];
  attributes?: Record<string, any>;
}
