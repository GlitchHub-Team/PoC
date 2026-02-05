# PoC
Repository principale del Proof of Concept di GlitchHub Team

# NSC(opzionale)
Strumento CLI per la gestione di utenti, permessi e configurazione di NATS. Per installarlo, seguire le istruzioni ufficiali: [https://docs.nats.io/nats-tools/nsc/installation](https://github.com/nats-io/nsc#install)

## Configurazione NSC(opzionale)
- Eseguire comando `nsc init`
- Eseguire comando `nsc import operator --jwt ./nats-jetstream/jwt-accounts/operator/operator.jwt`
- Eseguire comando `nsc pull -A --ca-cert nats-jetstream/certs/ca.pem` per scaricare account
- Controlla che l'operator sia stato configurato con `nsc describe operator`


# Avvio
## Avvio NATS, database TimeScaleDB e backend Gin
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
