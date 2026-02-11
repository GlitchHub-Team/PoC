= Confronto fra tecnologie di frontend

== Angular

=== Vantaggi

- *Framework completo*: include nativamente routing, gestione form, client HTTP e internazionalizzazione, evitando al team di dover valutare e integrare librerie esterne.

- *TypeScript obbligatorio*: la tipizzazione statica riduce errori a runtime e facilita la collaborazione tra membri del team con diversi livelli di esperienza nel frontend.

- *Struttura standardizzata*: le convenzioni rigide garantiscono consistenza del codice, permettendo a qualsiasi membro del gruppo di intervenire su qualsiasi parte del frontend senza difficoltà.

- *Dependency Injection*: sistema built-in che semplifica la gestione dei servizi e l'integrazione con le API backend sviluppate dal resto del team.

- *Angular CLI*: la generazione automatica di componenti e servizi velocizza lo sviluppo.

- *Documentazione ufficiale completa*: la documentazione dettagliata di Google facilita l'apprendimento autonomo da parte di tutti i membri del gruppo.

=== Svantaggi

- *Curva di apprendimento ripida*: richiede tempo iniziale per apprendere TypeScript, RxJS e i concetti specifici del framework.

- *Verbosità*: necessita di più boilerplate code, aumentando il tempo di sviluppo per funzionalità semplici.

- *Complessità iniziale*: la configurazione del progetto può risultare ostica per chi si approccia per la prima volta allo sviluppo frontend.

== React

=== Vantaggi

- *Semplicità iniziale*: la curva di apprendimento è più graduale, basandosi principalmente su JavaScript e JSX.

- *Flessibilità architetturale*: libertà di scegliere le librerie preferite per ogni funzionalità del progetto.

- *Community vasta*: ecosistema ampio con numerose risorse didattiche utili per l'apprendimento autonomo.

- *Leggerezza*: essendo una libreria UI, permette di includere solo le funzionalità effettivamente necessarie.

=== Svantaggi

- *Decision fatigue*: ogni aspetto del progetto (routing, state management, form handling) richiede la scelta e l'integrazione di librerie esterne, sottraendo tempo allo sviluppo.

- *Mancanza di standardizzazione*: senza convenzioni rigide, membri diversi del team potrebbero adottare stili e pattern differenti, complicando la manutenzione e la revisione del codice.

- *Coordinamento complesso*: la libertà architetturale può generare inconsistenze e rendere complesso coordinare tutti i membri del gruppo.

- *TypeScript opzionale*: senza una configurazione esplicita, si perde il vantaggio della tipizzazione statica che facilita la collaborazione.

= Motivazione della scelta

Per il presente progetto si è scelto *Angular* per le seguenti ragioni:

- *Team eterogeneo*: la struttura rigida del framework garantisce che tutti i membri del gruppo possano contribuire al frontend seguendo le stesse convenzioni, indipendentemente dal proprio ruolo principale.

- *Integrazione con il backend*: il modulo HttpClient con gli interceptors semplifica la comunicazione con le API REST sviluppate dal team backend e la gestione centralizzata dell'autenticazione.

- *Tempistiche accademiche*: la soluzione "tutto incluso" evita di investire tempo nella valutazione e configurazione di librerie esterne.

- *Manutenibilità*: la standardizzazione del codice facilita le revisioni tra pari e la stesura della documentazione tecnica richiesta dal progetto.