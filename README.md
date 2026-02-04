# PoC
Repository principale del Proof of Concept di GlitchHub Team

## Avvio dashboard
Per avviare la dashboard, vedere le istruzioni in `dashboard/README.md`

## Avvio NATS e database TimeScaleDB
Per avviare NATS e TimeScaleDB utilizzare il file `docker-compose.yml` presente nella cartella principale del progetto. Eseguire il comando:
```
docker-compose up -d
```

## Avvio Publisher e Subscriber
Per avviare il publisher(gateway simulato) e il subscriber (servizio di persistenza dati) utilizzare i comandi:
```
go run -C publisher .

go run -C subscriber .
```
