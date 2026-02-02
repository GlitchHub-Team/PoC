import { readFileSync } from 'node:fs';
import adminClient from './keycloak-admin-client.js';


async function add_tenant(
    tenant_name
) {
    await adminClient.realms.create(
        // JSON.parse(readFileSync(new URL('../config/realm-import.json', import.meta.url), 'utf8'))
        {
            "realm": tenant_name,
            "enabled": true,
            "clients": [
                {
                    "clientId": "poc-dashboard",
                    "enabled": true,
                    "bearerOnly": false
                },
                {
                    "clientId": "test-cli",
                    "enabled": true,
                    "publicClient": true,
                    "directAccessGrantsEnabled": true
                }
            ],
            "users": [
                {
                    "username" : "user",
                    "enabled": true,
                    "email" : "user@example.org",
                    "firstName": "",
                    "lastName": "",
                    "credentials" : [
                        {"type" : "password", "value" : "user"}
                    ],
                    "realmRoles": ["tenant-user", "offline_access"],
                    "clientRoles": {
                        "account": [ "manage-account" ]
                    }
                },
                {
                    "username" : "admin",
                    "enabled": true,
                    "email" : "admin@example.com",
                    "firstName": "",
                    "lastName": "",
                    "credentials" : [
                        {"type" : "password", "value" : "admin"}
                    ],
                    "realmRoles": ["tenant-user", "tenant-admin"],
                    "clientRoles": {
                        "realm-management": [ "realm-admin" ],
                        "account": [ "manage-account" ]
                    }
                }
            ],
            "roles" : {
                "realm" : [
                    {"name": "tenant-user", "description": "User privileges"},
                    {"name": "tenant-admin", "description": "Administrator privileges"}
                ]
            }
        }
    );
}

export {add_tenant}