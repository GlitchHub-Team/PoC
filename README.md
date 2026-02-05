# PoC
Repository principale del Proof of Concept di GlitchHub Team

# Setup NATS
## Creazione JWT subscriber
- Navigare nella cartella `subscriber`:
- Creare file `dataconsumer.creds`
- Inserire credenziali da Bitwarden nella cartella *JWT* e chiamato *Dataconsumer*

## Creazione JWT gateways
- Navigare nella cartella `publisher/gateway`:
- Creare file `gateway1.creds` e `gateway2.creds`
- Inserire credenziali da Bitwarden nella cartella *JWT* e chiamato *Gateway1* e *Gateway2* nei rispettivi file

## Creazione JWT operator
- Navigare nella cartella `nats-jetstream/jwt-accounts/operator`
- Creare file `operator.creds`
- Inserire credenziali da Bitwarden nella cartella *JWT* e chiamato *Operator*
- Creare file `operator.key` e inserire chiave privata da Bitwarden nella cartella *JWT* e chiamato *Operator*

## Creazione JWT accounts
- Navigare nella cartella `nats-jetstream/jwt-accounts/`
- Creare 4 file:
  - `AABY2DO7DSMREF5JTEM3MEA4DSMPR2U346WTMLNMMX6V5GLY7L7JVGFT.jwt`
  - `AALQCF4M7HNUZXTTUJYH4LYH2KR7XYNOEGACORLW7AQNUVOI46EMWKHE.jwt`
  - `AB3F36M2QRBGJZE4SR5UX27H57PGFZH5XDLDGZM2LMO6MN26KD6QEY2N.jwt`
  - `ACY677QPJKND2B2CDERFESCFEHGGWMDXGEFQZBAY3YGG4SFCADWIYYSZ.jwt`
- Inserire credenziali da Bitwarden nella cartella *JWT* e chiamati come il relativo file

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


# Avvio NATS e database TimeScaleDB
Per avviare NATS e TimeScaleDB utilizzare il file `docker-compose.yml` presente nella cartella principale del progetto. Eseguire il comando:
```
docker-compose up -d
```

# Avvio Publisher e Subscriber
Per avviare il publisher(gateway simulato) e il subscriber (servizio di persistenza dati) utilizzare i comandi(dalla root del progetto):
```
go run -C publisher .

go run -C subscriber .
```
