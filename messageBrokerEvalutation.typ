= Comparazione tra Message Broker
https://onidel.com/blog/nats-jetstream-rabbitmq-kafka-2025-benchmarks
https://docs.nats.io/nats-concepts/overview/compare-nats (biased)

== NATS JetStream
=== Vantaggi
- Prestazioni elevate con bassa latenza e alto throughput.
- Architettura leggera e semplice da configurare.
- Facilmente scalabile orizzontalmente, ogni stream ha il numero di leader e di follower, algoritmo di consenso Raft.
- Ottimo per IoT
- Sistema di persistenza con JetStream
- Integrazione con Prometheus per il monitoraggio.
- Dashboards Grafana preconfigurate
- Consigliato da M31
- Multi tenancy nativo con Accounts, ogni account può avere stream/consumer isolati con permessi specifici, risorse isolate completamente
- Le nostre istanze saranno dockerizzate, ma NATS può essere compilato su server che supportano Golang, ovvero il nostro linguaggio di sviluppo backend

=== Svantaggi
- Meno funzionalità avanzate rispetto a RabbitMQ e Kafka.
- Comunità e supporto più piccoli rispetto a RabbitMQ e Kafka.

== RabbitMQ
=== Vantaggi
- Ampia gamma di funzionalità e plugin.
- Supporto per vari protocolli di messaggistica (AMQP, MQTT, STOMP).
- Comunità ampia e attiva.
- Scalabile orizzontalmente sulle queues, con un principio simile a NATS
- Supporta multi tenancy attraverso Virtual Hosts, non c'è condivisione di dati tra Virtual Hosts
- Prometheus plugin e Grafana dashboards

=== Svantaggi
- Prestazioni inferiori rispetto a NATS e Kafka in scenari ad alto throughput.
- Non propriamente adatto a scenari multi tenant, gestione più complessa rispetto a NATS
- Il server richiede la Erlang VM e le dipendenze associate, non è leggero come NATS

== Apache Kafka
=== Vantaggi
- Progettato per l'elaborazione di flussi di dati in tempo reale.
- Altamente scalabile e resiliente.
- Ampio ecosistema di strumenti e integrazioni.
- Molti tool proprietari per la gestione e il monitoraggio

=== Svantaggi
- Complessità di configurazione e gestione.
- Sconsigliato da M31
- Overhead elevato per il nostro caso d'uso
- Non adatto a scenari multi tenant senza configurazioni complesse e gestione separata dei cluster
- Multi tenancy non supportata
- Si porta dietro la JVM, non è leggero come NATS
