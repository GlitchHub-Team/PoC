# PoC
Repository principale del Proof of Concept di GlitchHub Team

# Setup NATS

## Creazione certificati TLS per NATS
- Navigare nella cartella `nats-jetstream/certs`
- Creare file `ca.pem`, `server.key` e `server.pem`
- Inserire rispettivamente i valori da Bitwarden dalla cartella *Certificati NATS* e chiamati `NATS_CA_PEM`, `NATS_SERVER_KEY` e `NATS_SERVER_PEM`

## Creazione chiave pubblica per Publisher e Subscriber
- Navigare nella cartella `publisher/certs`
- Creare file `ca.pem`
- Inserire il valore da Bitwarden dalla cartella *Certificati NATS* e chiamato `NATS_CA_PEM`
- Navigare nella cartella `subscriber/certs`
- Creare file `ca.pem`
- Inserire il valore da Bitwarden dalla cartella *Certificati NATS* e chiamato `NATS_CA_PEM`

# NSC
Strumento CLI per la gestione di utenti, permessi e configurazione di NATS. Per installarlo, seguire le istruzioni ufficiali: [https://docs.nats.io/nats-tools/nsc/installation](https://github.com/nats-io/nsc#install)

## Configurazione NSC
- Eseguire comando `nsc init`
- Eseguire comando `nsc import operator --jwt ./nats-jetstream/jwt-accounts/operator/operator.jwt`
- Eseguire comando `nsc pull -A --ca-cert nats-jetstream/certs/ca.pem` per scaricare account
- Controlla che l'operator sia stato configurato con `nsc describe operator`


# Setup NATS

## Creazione certificati TLS per NATS
- Navigare nella cartella `nats-jetstream/certs`
- Creare file `ca.pem`, `server.key` e `server.pem`
- Inserire rispettivamente i valori da Bitwarden dalla cartella *Certificati NATS* e chiamati `NATS_CA_PEM`, `NATS_SERVER_KEY` e `NATS_SERVER_PEM`

## Creazione chiave pubblica per Publisher e Subscriber
- Navigare nella cartella `publisher/certs`
- Creare file `ca.pem`
- Inserire il valore da Bitwarden dalla cartella *Certificati NATS* e chiamato `NATS_CA_PEM`
- Navigare nella cartella `subscriber/certs`
- Creare file `ca.pem`
- Inserire il valore da Bitwarden dalla cartella *Certificati NATS* e chiamato `NATS_CA_PEM`

# NSC
Strumento CLI per la gestione di utenti, permessi e configurazione di NATS. Per installarlo, seguire le istruzioni ufficiali: [https://docs.nats.io/nats-tools/nsc/installation](https://github.com/nats-io/nsc#install)

## Configurazione NSC
- Eseguire comando `nsc init`
- Eseguire comando `nsc import operator --jwt ./nats-jetstream/jwt-accounts/operator/operator.jwt`
- Eseguire comando `nsc pull -A --ca-cert nats-jetstream/certs/ca.pem` per scaricare account
- Controlla che l'operator sia stato configurato con `nsc describe operator`


## Avvio dashboard
Per avviare la dashboard, vedere le istruzioni in `dashboard/README.md`

## Avvio NATS e database TimeScaleDB
Per avviare NATS e TimeScaleDB utilizzare il file `docker-compose.yml` presente nella cartella principale del progetto. Eseguire il comando:
```
docker-compose up -d
```

## Avvio Publisher e Subscriber
Per avviare il publisher(gateway simulato) e il subscriber (servizio di persistenza dati) utilizzare i comandi(dalla root del progetto):
```
go run -C publisher .

go run -C subscriber .
```
