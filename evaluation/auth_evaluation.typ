= Autenticazione lato dashboard
E' stato scelto di usare una soluzione nativa per motivi di tempo e perché un sistema robusto di autenticazione non porta alcun valore al PoC, il quale deve mostrare la capacità del gruppo di integrare insieme tecnologie che non sono ovvie. L'autenticazione, per quanto fondamentale in ogni prodotto software web, ai fini del PoC viene implementato nella dashboard usando una soluzione nativa con PostgreSQL e JWT, che non è pienamente robusta.

== Keycloak
=== Vantaggi
- Gestione automatica della multi-tenancy e del controllo degli accessi
- Gestione tramite console già preconfigurata e API REST dedicata
- Mette a disposizione delle pagine di login già configurate che permettono di ridirezionare l'utente alla propria dashboard
- Usa sistemi di autenticazione e autorizzazione robusti
- Progettato per essere distribuito su più nodi

=== Svantaggi
- Tedioso da configurare, abbiamo preferito concentrare i nostri sforzi sulle tecnologie più fondamentali per il PoC
- Complicata la gestione del redirect degli utenti
- Essendo eseguito sulla JVM, la sua esecuzione può causare overhead

== Soluzione nativa con PostgreSQL e JWT
=== Vantaggi
- Immediatezza di sviluppo, configurazione e prototipazione, aspetto fondamentale per quanto detto nell'introduzione
- Non richiede esecuzione su JVM, quindi comporta meno overhead

=== Svantaggi
- E' un sistema meno robusto
- Non si ha separazione logica dei tenant, né gestione nativa del controllo degli accessi
