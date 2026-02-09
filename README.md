# PoC
Repository principale del Proof of Concept di GlitchHub Team.

## Prerequisiti
- Avere [Docker](https://www.docker.com/get-started/) installato nel proprio sistema
- Eseguire il **Docker Engine**

## Esecuzione
Non sono richiesti ulteriori passaggi di configurazione in quanto tutti i file con variabili d'ambiente e *secrets* sono presenti nella repository per questioni di semplicità.

Per eseguire il Proof of Concept, è sufficiente eseguire sul proprio terminale il seguente comando all'interno della cartella del Proof of Concept
```bash
docker compose up -d --build
```

Per interrompere l'esecuzione è sufficiente eseguire sulla stessa cartella il comando:
```bash
docker compose down
```

Quindi sarà possibile accedere ai seguenti servizi:
- Dashboard del PoC (Gin + Angular) all'indirizzo http://localhost
- Dashboard di **Grafana** all'indirizzo http://localhost:3000/d/nats-minimal/nats-minimal
- Dashboard di **Adminer** all'indirizzo http://localhost:8081

### Dashboard PoC
È la dashboard principale del PoC, il cui backend è creato in **Gin** e frontend in **Angular.js**. Permette di visualizzare dati in real-time e dati storici di sensori simulati associati un certo *tenant*.

Per poter accedere è necessario creare prima un utente associato al "Tenant 1" e poi accedere con tali credenziali.

### Dashboard di Grafana
**Grafana** è lo strumento di *observability* scelto dal gruppo, permette di visualizzare il numero di connessioni attive e la mole di dati inviati nel sistema.

Vi si può accedere con le credenziali `admin / admin`.

### Dashboard di Adminer
**Adminer** è uno strumento di gestione del database, utile in fase di sviluppo.

Vi si può accedere usando le credenziali:
- **Sistema**: PostgreSQL
- **Server**: `timescaledb`
- **Utente**: `admin`
- **Password**: `admin`
- **Database**: `sensors_db`

## Tecnologie usate
- **Go**:
    - Usato nel client NATS di *publisher* e *subscriber*
    - Usato come linguaggio per *backend* della [dashboard principale](#dashboard-poc)
- **NATS JetStream**: Sistema di messaggistica che consente a publisher e subscriber di comunicare in maniera sicura
- **TimescaleDB**: Sistema di persistenza di dati di *publisher* e *subscriber* e persistenza di informazioni di autenticazione
- **Gin**: Framework web per *backend* della [dashboard principale](#dashboard-poc)
- **Angular.js**: Framework usato per *frontend* della [dashboard principale](#dashboard-poc)
- **Prometheus + Grafana**: Sistema di *observability* per controllo delle metriche di sistema

Tecnologie secondarie
- **Nginx**: Sistema di reverse proxy
- **Adminer**: Gestione del database