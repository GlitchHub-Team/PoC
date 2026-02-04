# Dashboard
In questa cartella è presente il codice sorgente della Dashboard, creata con Angular.js e Gin.

## Parti
La dashboard è composta da:
- Frontend _(ancora da fare)_
- Backend
- Proxy _(ancora da fare, al momento non compare nel compose perché non serve)_

Andare nelle relative cartelle per ulteriori informazioni

## Esecuzione
- Bisogna avere Docker installato e il Docker Engine dev'essere in esecuzione

- Eseguire questi comandi nella shell
    ```
    cd src/dashboard
    docker compose up -d
    ```

- Con un po' di pazienza si potrà trovare la dashboard su http://localhost:3000

- Per interrompere l'esecuzione:
    ```
    docker compose down
    ```
