# Dashboard
In questa cartella è presente il codice sorgente della Dashboard, creata con Angular.js e Gin.

## Parti
La dashboard è composta da:
- Frontend: è ancora da fare, però ho trovato la repo [`cmense/go-gin-ng6-starter`](https://github.com/cmense/go-gin-ng6-starter/tree/master), che mostra come integrare Gin e Angular **versione 6 (molto vecchia!)**. Ancora non ho guardato, ma di sicuro può fornire una base su cui basarsi.
- Backend: fatto con Gin
- Proxy: c'è la configurazione nella cartella `proxy`, ma non è utilizzata nel compose perché non serve... intanto lo teniamo per buona misura

Andare nelle relative cartelle per ulteriori informazioni

## Esecuzione
- Bisogna avere Docker installato e il Docker Engine dev'essere in esecuzione (se si usa Docker Desktop, bisogna accenderlo)

- La prima volta (oppure ogni volta che si modifica il Dockerfile presente in `dashboard/backend`) eseguire questi comandi nel terminale
    ```
    cd src/dashboard
    docker compose up -d --build
    ```

- Invece, per tutte le altre esecuzioni, eseguire:
    ```
    cd src/dashboard
    docker compose up -d
    ```

- Con un po' di pazienza si potrà trovare la dashboard su http://localhost:3000

- Su http://localhost:8081 si troverà la pagina Adminer, uno strumento per gestire il database simile a pgAdmin

- Per interrompere l'esecuzione:
    ```
    docker compose down
    ```
