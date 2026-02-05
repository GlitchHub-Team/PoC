package main

import (
	"crypto/x509"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/nats-io/nats.go"
)

func main() {

	url := "ws://localhost:443"

	certPool := x509.NewCertPool()
	caData, err := os.ReadFile("certs/ca.pem")

	if err != nil {
		log.Fatalf("Errore lettura file: %v", err)
	}
	if ok := certPool.AppendCertsFromPEM(caData); !ok {
		log.Fatal("Impossibile aggiungere il certificato CA al pool: il formato potrebbe essere errato")
	}

	opts := []nats.Option{
		nats.UserCredentials("wsTenant1.creds"),
		nats.Timeout(10 * time.Second),
		nats.RootCAs("certs/ca.pem"),
	}

	nc, err := nats.Connect(url, opts...)
	if err != nil {
		log.Fatal(err)
	}
	defer nc.Close()

	log.Printf("Connesso con successo a %s via WebSocket!", nc.ConnectedAddr())
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	sub, err := nc.Subscribe("sensors.tenant_1.>", func(msg *nats.Msg) {
		fmt.Println("Client in ascolto... premi Ctrl+C per uscire")
		fmt.Printf("Ricevuto messaggio su soggetto %s: %s\n", msg.Subject, string(msg.Data))
	})

	if err != nil {
		log.Fatal(err)
	}

	defer sub.Unsubscribe()

	fmt.Println("Client in ascolto... premi Ctrl+C per uscire")

	<-sigCh

	fmt.Println("\nChiusura in corso...")
	nc.Drain()
}
