= Valutazione framework di backend
Per sviluppare l'API di backend in Go, abbiamo considerato due alternative principali: *Gin*, *Fiber* e *Chi*.

Abbiamo scelto di utilizzare *Gin*

== Gin

=== Vantaggi
- *Maturità e popolarità: l'ecosistema di Gin è più maturo, rendendo più facile la soluzione di problemi e di casi d'utilizzo particolari
- *Ampia documentazione*: La doucmentazione offerta da Gin è ampia e descrive molti casi d'utilizzo
- *Flessibilità*: Gin offre un sistema di routing più flessibile e un'ampia gamma di _middleware_ che permette di avere più personalizzazione e controllo sull'applicazione sviluppata, rendendolo la scelta perfetta per lo sviluppo di API REST
- *Design modulare e leggero*: Gin offre delle fondamenta solide ma leggere su cui basare la propria appllicazione, diventando estendibile secondo necessità
- *Velocità nello sviluppo*: Gli strumenti offerti da Gin consentono tempi di prototipazione e sviluppo rapidi

=== Svantaggi
- *Performance*: Sebbene Gin sia molto performante essendo basato su *Go*, non è il framework più veloce. Ciò, però, non è troppo problematico per l'utilizzo del framework nell'ambito di sviluppo di API REST.
- *Aalità della documentazione*: Alcuni sviluppatori riportano che ci siano delle carenze nella documentazione relativamente a casi d'utilizzo più avanzati del framework

== Fiber

=== Vantaggi
- *Performance*: Basandosi su fasthttp, consente di raggiungere livelli di performance più alti in casi d'uso specifici, essendo una buona scelta per lo sviluppo di microservizi
- *Semplicità*: Fiber utilizza una sintassi minimalista per la definizione delle _route_ e dei _middleware_, essendo una buona scelta per progetti più piccoli
- *Buon utilizzo della memoria*: Fiber utilizza le risorse in modo efficiente

=== Svantaggi
- *Problemi di compatibilità*: La libreria fasthttp, per quanto veloce, è incompatibile con gran parte della libreria standard di *Go*, che è scritta per essere compatibile con net/http (la libreria http standard di Go)
- *Limitatezza*: L'utilizzo della libreria fasthttp rende inutilizzabili molto _middleware_ specifici e l'utilizzo del protocollo HTTP/2, in quanto non supportato
- *Ecosistema più ristretto*: Essendo un framework meno utilizzato, Fiber ha una documentazione e una community più ristrette

== Chi

=== Vantaggi
- *Design minimalista*: Chi è la libreria HTTP più minimalista, possedendo solo funzionalità di _routing_
- *Integrazione con stdlib*: Chi si integra perfettamente con la libreria standard di Go e ne richiede un grande utilizzo per funzionalità oltre il _routing_
- *Performance*: Essendo un'astrazione molto leggera sulla libreria standard, Chi ha una performance molto alta
- *Documentazione*: La documentazione di Chi presenta esempi chiari e spiega quali siano le _best practices_ da adottare nel suo utilizzo

=== Svantaggi
- *Mancanza di funzionalità*: Dato il suo minimalismo, Chi non implementa feature come la validazione degli input, il rendering di pagine statiche o gli ORM, i quali vanno implementati a mano oppure con librerie separate che aumentano l'overhead dell'applicativo
- *Community più piccola*: Ci sono meno tutorial e _middleware_ di terze parti rispetto a framework quali Gin
- *Lentezza nello sviluppo*: Questi fattori si traducono in una maggiore lentezza nello sviluppo, il quale richiede di implementare molte cose a mano o con altre librerie

== Conclusione
Abbiamo scelto Gin, in quanto si può considerare il miglior framework per il nostro caso d'utilizzo, ovvero lo sviluppo di API REST e backend di una Single Page Application i quali devono essere scalabili e sviluppabili in tempi rapidi e co


in:
- Sviluppo di API REST / back-end di SPA
- Progetto che richiede tempi di sviluppo rapidi
- Progetto che richiede grado di scalabilità moderato
