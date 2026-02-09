# NATS Server
- Install nats CLI: go install github.com/nats-io/natscli/nats@latest
## Start NATS server
- Get the docker image: docker pull nats:latest
- Run the NATS server: docker run -p 4222:4222 -ti nats:latest

## Wildcards 
- Subscribers possono usare le wildcards per ascoltare a più Subjects
- Publishers possono mandare un messaggio solo ad un Subject specifico
- `*`: corrisponde a un singolo token in un Subject
  - Esempio: `orders.*` corrisponde a `orders.created`, `orders.updated`, ma non a `orders.created.new`
- `>`: corrisponde a uno o più token alla fine di un Subject
  - Esempio: `orders.>` corrisponde a `orders.created`, `orders.updated`, `orders.created.new`, ecc.

## Subjects
- I Subjects possono essere organizzati in una gerarchia (sub-subjects) usando il carattere punto (.)
- Esempio: "orders.created" e "orders.updated" sono due Subjects diversi sotto la gerarchia "orders"
- La lunghezza massima (consigliata) di un Subject è di 256 caratteri
- NATS può gestire più di 10 milioni di Subjects efficacemente
- Si può filtrare quali utenti vedono quali messaggi basandosi sui Subjects
- Un utente può anche avere solo permessi di scrittura o lettura su specifici Subjects
- Si possono applicare trasformazioni ai messaggi mentre passano tra account diversi, aggiungere/rimuovere header
- Un Subject dovrebbe essere usato per più di un messaggio, per più di un tipo di messaggio, per più di un consumer, non dovrebbe contenere troppi dati o logica di business
- *Pedantic mode*: al publishing controlla che il Subject sia valido(di solito non lo fa, fa il publishing comunque), si attiva dal client o dal server
- C'è la *Request-Reply* ovvero dopo che un Publisher manda un messaggio il Subscriber può rispondere con un messaggio di risposta, il Publisher è chiamato *inbox*, è possibile ricevere più risposte il sistema considera solo la prima risposta ricevuta
- Se c'è un messaggio inviato a un Subject con più Subscribers, tutti i Subscribers ricevono il messaggio (pub-sub pattern)
- *NATS Core* necessita che ci sia *un Subscriber attivo* per un Subject per poter mandare messaggi a quel Subject, altrimenti il messaggio viene scartato

## Delivery Policy
- NATS: at-most-once delivery (best-effort), ovvero se il Subscriber sta per ricevere il messaggio ma si disconnette prima di riceverlo, il messaggio viene perso
- NATS Streaming: at-least-once delivery (con persistency)
- NATS JetStream: at-least-once delivery (con persistency), exactly-once delivery (con deduplication)

## Message
- I messaggi sono composti da:
  - Subject
  - Payload in forma di byte array, default max size 1MB (configurabile) fino a 64MB, consigliato massimo 8MB
  - Headers opzionali (simili agli header HTTP)

## Scaling
- NATS può essere scalato orizzontalmente *on demand*
- NATS è "drain before exiting" ovvero può fare scale down senza perdere messaggi, perchè li processa prima di chiudere la connessione

## Queue Groups
- I *Subscribers* possono essere organizzati in *Queue Groups*
- Perfetti per scalare orizzontalmente il consumo dei messaggi
- I messaggi inviati a un Subject con più Subscribers in uno stesso Queue Group vengono consegnati a un solo Subscriber del Queue Group (load balancing)
- Vantaggi: *scalabilità orizzontale dei Subscribers* senza duplicazione dei messaggi, fault tolerance
- Svantaggi: non si ha la garanzia che tutti i Subscribers ricevano tutti i messaggi

### Alternativa ai Queue Groups: Stream ad Queue
- Usare JetStream con WorkQueuePolicy, così ogni messaggio viene consegnato a un solo consumer
- Vantaggi: persistenza dei messaggi, consegna affidabile (at-least-once delivery), monitoraggio e gestione dei messaggi
- Svantaggi: maggiore complessità nell'implementazione, overhead di gestione del stream


# NATS JetStream
- sistema che aggiunge un layer di persistenza e funzionalità avanzate sopra NATS Core
- permette comunicazioni asincrone tra Publishers e Subscribers con garanzie di consegna dei messaggi

## Replay policies
Possibilità di *Replay* dei messaggi, ovvero i Consumers possono rileggere i messaggi già processati *on demand*, 4 modalità:
  - L'ultimo messaggio
  - Da un timestamp specifico
  - Da un sequence number specifico
  - Tutti i messaggi nella stream, specificando se si voglio tutti il più velocemente possibile (instant) o rispettando la frequenza con cui sono arrivati (original)

## Retention policies
Definiscono come i messaggi vengono mantenuti nella stream, 5 modalità:
  - Maximum Age: i messaggi vengono mantenuti per un periodo di tempo specifico
  - Maximum Total Stream Size: la stream mantiene messaggi fino a una dimensione totale specifica(in bytes)
  - Maximum Message Count: la stream mantiene un numero massimo di messaggi
  - Maximum Individual Message Size: i messaggi più grandi di una dimensione specifica(in bytes) vengono scartati
Si possono pure limitare il numero di Consumers nella Stream specifica in un punto nel tempo
### Discard Policy
Definisce cosa succede quando si raggiungono i limiti di retention, 2 modalità:
  - Old: i messaggi più vecchi vengono scartati per fare spazio ai nuovi messaggi
  - New: i nuovi messaggi vengono scartati quando si raggiungono i limiti di retention
### Retention Policy
- Limits: i messaggi vengono mantenuti fino a quando non si raggiungono i limiti di retention specificati
- Interest: i messaggi vengono mantenuti finché ci sono Consumers interessati a quei messaggi
- WorkQueue: i messaggi vengono mantenuti fino a che non arriva un Consumer che li processa

## Data transformation
JetStream permette di applicare ai Subject una trasformazione dei dati pubblicati nella Stream

## Encryption
JetStream supporta la crittografia dei messaggi a riposo (at-rest) e in transito (in-transit) per garantire la sicurezza dei dati

## Criteri di scelta del numero di repliche
- Replicas=1 - Cannot operate during an outage of the server servicing the stream. Highly performant.
- Replicas=2 - No significant benefit at this time. We recommend using Replicas=3 instead.
- Replicas=3 - Can tolerate the loss of one server servicing the stream. An ideal balance between risk and performance.
- Replicas=4 - No significant benefit over Replicas=3 except marginally in a 5 node cluster.
- Replicas=5 - Can tolerate simultaneous loss of two servers servicing the stream. Mitigates risk at the expense of performance.

## Sync su disco
- La scrittura su disco non è sempre immediata, dopo un determinato intervallo di tempo la scrittura è garantita, parametro `sync_interval`, però in caso in quel momento crashi il server i dati possono essere persi nonostante sia stata mandata l'ACK.
- Il trade-off per il sync_interval è tra performance e garanzia di scrittura.
- Sulla NATS Documentation sono presenti le configurazioni consigliate

## Consumer Acknowledgment
- Gli un-acknowledged consumer sono quei consumer che non hanno ancora inviato l'acknowledgment per i messaggi ricevuti
Ci sono diversi tipi di ACK policy:
- None: il consumer non invia ACK, usato per i messaggi che non richiedono conferma
- Explicit: il consumer invia un ACK esplicito per ogni messaggio ricevuto e processato con successo
- All: il consumer invia un ACK per l'ultimo messaggio ricevuto, confermando implicitamente tutti i messaggi precedenti
- Negative: il consumer invia un NAK per indicare che un messaggio non è stato processato correttamente
- Progress: il consumer invia un ACK parziale per indicare che sta ancora elaborando il messaggio, così da alzare l'ACK Wait

## Funzionalità Key-Value Store
- JetStream offre una funzionalità di Key-Value Store che permette di memorizzare, recuperare e gestire coppie chiave-valore in modo semplice ed efficiente

## Funzionalità Object Store
- JetStream offre una funzionalità di Object Store che permette di memorizzare, recuperare e gestire oggetti binari di grandi dimensioni in modo semplice ed efficiente(>1MB a differenza del Key-Value Store)


# Security in NATS
## TLS
- NATS supporta TLS per criptare le comunicazioni tra client e server
- Supporta un bundle di ca_file, noi ne imposteremo uno per ogni gateway
- con `nats-server --signal reload` si può fare il reload delle certificazioni senza riavviare il server
- `cert_file` e `key_file` sono usati per l'autenticazione del server
- `ca_file` è usato per verificare i certificati dei client
- `verify_and_map` permette di mappare i certificati dei client agli utenti definiti nel file di configurazione
