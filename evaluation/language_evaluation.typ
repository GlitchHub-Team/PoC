= Confronto linguaggi di programmazione
== Go
=== Vantaggi
- Prestazioni elevate grazie alla compilazione nativa.
- Concorrenza efficiente con goroutine e canali.
- Sintassi semplice e leggibile, bassa curva di apprendimento.
- Ottima gestione della memoria.
- Ampio supporto per lo sviluppo di applicazioni web e di rete.
- Rapido startup time per rapida scalabilità delle istanze.
- Consigliato da M31

=== Svantaggi
- Mancanza di generics (anche se introdotti in versioni recenti, sono ancora limitati).
- Libreria standard meno ricca rispetto ad altri linguaggi.
- Conoscenza del linguaggio limitata da parte del gruppo

== Java
=== Vantaggi
- Portabilità grazie alla JVM (Java Virtual Machine).
- Ampia libreria standard e numerosi framework.
- Forte supporto per la programmazione orientata agli oggetti.
- Conoscenza maggiore del linguaggio all'interno del gruppo.
- Threading nativo ben supportato

=== Svantaggi
- Overhead della JVM che può influire sulle prestazioni, soprattutto sullo startup time => scalabilità più lenta.
- Sintassi più verbosa rispetto a Go.
- Maggiore consumo di memoria.
- Configurazione e gestione più complesse rispetto a Go.
- Threading più pesante rispetto alle goroutine di Go, Virtual Thread in Java non sono ancora all'altezza delle goroutine (https://medium.com/@manoj.k.swain.tech/go-goroutines-vs-java-virtual-threads-the-ultimate-concurrency-showdown-9efb05cf6a27)

== C\#
=== Vantaggi

- Massima competenza del team: Essendo il linguaggio più conosciuto dal gruppo

- Prestazioni eccellenti (Native AOT): Con le recenti evoluzioni di .NET, la compilazione Native Ahead-of-Time (AOT) permette startup time quasi istantanei e un consumo di memoria ridotto, avvicinandosi alle performance di Go

- AOT migliore in C\# rispetto a Java, secondo la community

- Sintassi meno verbosa di Java

- Ecosistema e Tooling: Supporto di prima classe con Visual Studio, JetBrains Rider e VS Code. La gestione dei pacchetti tramite NuGet è matura e integrata.

- Async/Await e Concorrenza: Il modello async/await è estremamente robusto e facile da debuggare, ideale per operazioni I/O bound

- Cross-platform maturo: .NET è perfettamente integrato in ambienti Linux e Docker, con performance spesso superiori a Java in scenari cloud-native.

=== Svantaggi

- Consumo di memoria: Sebbene migliorato drasticamente con Native AOT, il Garbage Collector di .NET tende a essere più pesante rispetto alla gestione della memoria di Go in scenari di base.

- Configurazione più complessa: La configurazione di progetti .NET può essere più articolata rispetto a Go

- Overhead dei Task: Sebbene molto efficienti, i Task di C\# non sono "leggeri" quanto le goroutine di Go a livello di scheduler di sistema (sebbene per la maggior parte degli scenari web la differenza sia trascurabile).
