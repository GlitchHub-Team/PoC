# Backend della dashboard
In questa cartella è presente il codice del backend della dashboard, fatto in Gin.

Al momento presenta una gestione CRUD di utenti divisi per tenant, ma l'API è estendibile.

Finché non è presente il frontend, la parte di UI è gestita con i template nella cartella `templates/`, ma questo cambierà molto presto.

## Come funziona?
Prima di capire questo, è importante conoscere Go e Gin.
- [Tutorial Go](https://go.dev/tour/)
- [Docs Gin](https://gin-gonic.com/en/docs) (non sono pienamente comprensivi)

In generale, questo progetto si basa su [questo post](https://ututuv.medium.com/building-user-authentication-and-authorisation-api-in-go-using-gin-and-gorm-93dfe38e0612)

In generale, questa demo utilizza un abbozzo di pattern MVC molto basilare:
- Nella cartella `controllers` ci sono i controller, tutti nello stesso package di Go
- Nella cartella `models` ci sono i modelli e anche gli struct `authInput` e `tenantInput` che invece servono per gestire l'input utente via form
    - L'accesso al database (di cui si occupano i models) avviene tramite la libreria [GORM](https://gorm.io/docs/)
- Nella cartella `views` c'è la funzione helper per visualizzare i template, situati nella cartella `templates`
    - I template rispettano la sintassi del [package `text/template`](https://pkg.go.dev/text/template)
    - Il path di un template dentro la cartella `templates` dev'essere uguale al path relativo della pagina nel sito web. Ad esempio la pagina `user/profile` ha come file di template `templates/user/profile.tmpl` (attenzione all'estensione `tmpl` e non `html`)

La cartella `middlewares` contiene i middleware, ovvero le funzioni che vengono chiamate dal router HTTP prima di servire la pagina all'utente. Nello specifico, sono presenti solo i middleware di autenticazione, che avviene tramite [JSON Web Token (JWT)](https://www.jwt.io/introduction#what-is-json-web-token), i quali permettono di gestire le sessioni web senza salvare alcun dato lato server.

La cartella `migrate` invece contiene gli script per portare il database secondo le specifiche nei file di modello nella cartella `models`. Lo script di migrazione viene chiamato automaticamente quando si esegue il server.

## Esecuzione

### Impostazione variabili d'ambiente
E' fondamentale prendere il file `.example-env` e farne una copia chiamata `.env`, in qui impostare la variabile `SECRET`. La buona prassi vuole che si metta una stringa generata con sistemi crittograficamente sicuri, ma ai fini del PoC si può mettere qualunque cosa. La sicurezza non è priorità del PoC.

### Docker compose
Consiglio di usare il docker compose generale, altrimenti bisogna fare tante modifiche.

## Approfondimenti
- [Tutorial Go](https://go.dev/tour/)
- [Riferimento package Go `text/template`](https://pkg.go.dev/text/template)
- [Documentazione Gin](https://gin-gonic.com/en/docs)
- [Documentazione GORM](https://gorm.io/docs/)
- [Post di Medium di riferimento](https://ututuv.medium.com/building-user-authentication-and-authorisation-api-in-go-using-gin-and-gorm-93dfe38e0612)
- [Intro ai JSON Web Token (JWT)](https://www.jwt.io/introduction#what-is-json-web-token) (in teoria con questi siamo a posto)