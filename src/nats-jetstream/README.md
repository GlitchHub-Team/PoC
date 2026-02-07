# Certificati
## Creare chiave privata
Creare file chiamato `ca.key` nella cartella `ca` ed inserire il contenuto trovato su Bitwarden come `NATS_CA_KEY` nella cartella `Certificati NATS`.

## Creare certificato
Creare file chiamato `ca.pem` nella cartella `ca` ed inserire il contenuto trovato su Bitwarden come `NATS_CA_PEM` nella cartella `Certificati NATS`.

## Creare server key
Creare file chiamato `server.key` nella cartella `certs` ed inserire il contenuto trovato su Bitwarden come `NATS_SERVER_KEY` nella cartella `Certificati NATS`.

## Creare server cert
Creare file chiamato `server.pem` nella cartella `certs` ed inserire il contenuto trovato su Bitwarden come `NATS_SERVER_PEM` nella cartella `Certificati NATS`.

# NSC
Strumento CLI per la gestione di utenti, permessi e configurazione di NATS. Per installarlo, seguire le istruzioni ufficiali: [https://docs.nats.io/nats-tools/nsc/installation](https://github.com/nats-io/nsc#install)

## Creare operator
Creare un operatore chiamato `admin` con il comando:
```bash
nsc add operator admin
```

## Creare account data_consumer
Creare un account chiamato `data_consumer` con il comando:
```bash
nsc add account consumers
```

## Creare account tenants
Creare due account chiamati `tenant_1` e `tenant_2` con il comando:
```bash
nsc add account tenant_1
nsc add account tenant_2
```

## Creare user per data consumer
Creare un utente chiamato `dataconsumer` associato all'account `data_consumer` con il comando:
```bash
nsc add user --account consumers --name dataconsumer --allow-sub "sensors.>" --deny-pub ">"
```

## Creare users per tenant_1 e tenant_2
Creare un utente chiamato `tenant_1_user` associato all'account `tenant_1` e un utente chiamato `tenant_2_user` associato all'account `tenant_2` con i corretti permessi:
```bash
nsc add user --account tenant_1 --name gateway1 --allow-pub "sensors.tenant_1.>" --deny-sub ">"

nsc add user --account tenant_2 --name gateway2 --allow-pub "sensors.tenant_2.>" --deny-sub ">"
```

