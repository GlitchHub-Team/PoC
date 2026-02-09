# NSC(opzionale)
Strumento CLI per la gestione di utenti, permessi e configurazione di NATS. Per installarlo, seguire le istruzioni ufficiali: [https://docs.nats.io/nats-tools/nsc/installation](https://github.com/nats-io/nsc#install)

## Configurazione NSC(opzionale)
- Eseguire comando `nsc init`
- Eseguire comando `nsc import operator --jwt ./nats-jetstream/jwt-accounts/operator/operator.jwt`
- Eseguire comando `nsc pull -A --ca-cert nats-jetstream/certs/ca.pem` per scaricare account
- Controlla che l'operator sia stato configurato con `nsc describe operator`


# Avvio
## Avvio NATS, database TimeScaleDB, backend Gin e frontend Angular
Per avviare NATS e TimeScaleDB utilizzare il file `docker-compose.yml` presente nella cartella principale del progetto. Eseguire il comando:
```
sudo docker compose up -d
```
Ricordarsi di eseguire il file di dump situato in `src/database/schema/tables.sql` nel pannello `Adminer` una volta che si avvia il container docker.

## Avvio Publisher e Subscriber
Per avviare il publisher(gateway simulato) e il subscriber (servizio di persistenza dati) utilizzare i comandi(dalla root del progetto):
```
go run -C src/publisher .

go run -C src/subscriber .
```

# Monitoring NATS (Prometheus + Grafana)
Il progetto include una stack di monitoring pronta via `docker-compose.yml` per osservare NATS senza modificare il codice Go.

## Servizi e porte (host)
- NATS client: `4222`
- NATS monitoring (JSON): `8222` (es. `/varz`, `/connz`)
- NATS Prometheus exporter: `7777` (espone `/metrics`)
- Prometheus: `9090`
- Grafana: `3000` (login `admin` / `admin`)

## Avvio e verifiche rapide
1) Avvia i container (se non già fatto):
```
sudo docker compose up -d
```

2) Verifica che l'exporter esponga metriche Prometheus:
```
curl -i http://localhost:7777/metrics | head -n 20
```

3) Verifica che Prometheus scrapi NATS:
- Apri `http://localhost:9090/targets` e controlla che il job `nats` sia `UP`
- Oppure query in Prometheus: `up{job="nats"} == 1`

4) Apri Grafana:
- `http://localhost:3000`
- Dashboard: folder `NATS` → `NATS - Minimal`

## Generare traffico (per vedere i grafici muoversi)
Avvia il publisher (e opzionalmente il subscriber):
```
go run -C src/publisher .
go run -C src/subscriber .
```
I pannelli “Messaggi / s” e “Bytes / s” aumentano quando passano messaggi su NATS.

## Metriche misurate (NATS)
La dashboard `NATS - Minimal` misura metriche di NATS (via exporter), non metriche custom del codice applicativo che sono ovviamente implementabili:
- Connessioni attive: numero di client connessi a NATS (`*_varz_connections`)
- Messaggi / s: rate dei contatori messaggi in/out (`rate(*_varz_in_msgs[1m])`, `rate(*_varz_out_msgs[1m])`)
- Bytes / s: rate dei contatori byte in/out (`rate(*_varz_in_bytes[1m])`, `rate(*_varz_out_bytes[1m])`)

## Nota importante su /metrics
Su questa configurazione NATS non espone `http://localhost:8222/metrics` (può rispondere `404`): Prometheus legge le metriche tramite `nats-exporter` (`http://localhost:7777/metrics`).
