# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.0.

## Prerequisiti

- `node.js`
- `angular CLI`
- installare le dependencies con `npm install` dentro la cartella `/frontend`

## Eseguire il server

Si può testare il fronted senza far partire il backend grazie a `angular-in-memory-web-api`.
Questo pacchetto intercetta le richieste `HTTPClient` e le gestisce in un file in memory.
Il server può essere lanciato assieme al parametro `--configuration`:
- `ng serve --configuration development`: usa i dati mock selezionando come environment `environment.ts`
- `ng serve --configuration production`: fa richieste al vero backend selezionando come environment `environment.production.ts`
Ovviamente se si sceglie la configuration production il backend deve essere attivo, si può far partire tramite il docker compose in `src/dashboard`.

### Nota
Per il momento il collegamento API al backend è molto artigianale, permette di effettuare il login e la registrazione di nuovi utenti ma non di registrare tenant.

## Struttura del fronted:
Questo frontend bare-bones segue i buoni principi dello sviluppo di Angular:
- nella cartella `components` troviamo i componenti, ossia delle classi Typescript a cui associamo un template in HTML e un foglio di stile CSS
- nella cartella `guards` troviamo delle classi di "guardia", vengono usate nel file `app.routes.ts` per controllare se effettivamente si ha accesso alla pagina (ad esempio controllando se si è già autenticati si fa un redirect verso la propria dashboard)
- nella cartella `interceptors` troviamo gli interceptor HTTP, che si posizionano come middleman tra fronted e backend: il loro compito è modificare le request/response in transito (in particolare questo interceptor aggiunge un header che identifica il token JWT dell'utente)
- nella cartella `mock` si trova tutto il necessario per far funzionare l'app con un backend simulato interamente in Angular (in essenza la classe typescript intercetta le richieste fatte verso endpoint e le gestisce tramite funzioni)
- nella cartella `models` sono definiti i tipi custom da utilizzare nel progetto
- nella cartella `services` sono definite le classi typescript che si interfacciano effettivamente con gli endpoint, in particolare `tenant.service.ts` si occupa di recuperare i Tenant esistenti, mentre `auth.service.ts` si occupa di effettuare login, registrazione e recupero dei dati utente
- nella cartella `environments` troviamo i file che definiscono in che environment stiamo lanciando l'app (permettono di far funzionare il mock data)
- il file `app.routes.ts` mappa una specifica rotta (es. /dashboard) ad uno specifico component (ad esempio quando effettuo il login, dopo che ottengo l'ok dall'`auth.service` reindirizzo a /dashboard, in questo modo viene renderizzato il component dashboard)
- il file `app.config.ts` contiene le configurazioni globali dell'app Angular, ad esempio viene indicato di usare il routing, gli HTTP client (con interceptors) e di attivare il mock del backend se l'environment lo dice

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
