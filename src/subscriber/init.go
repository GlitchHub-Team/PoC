package main

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"

	dbaccess "subscriber/db-access"
	sensor "subscriber/sensorData"

	"github.com/nats-io/nats.go"
)

func InitSubscriber(natsURL string, consumerId string, credsPath string, dbURL string, wg *sync.WaitGroup) {
	defer wg.Done()

	nc, err := getNatsConnection(natsURL, "glitchhubteam.it", credsPath)
	if err != nil {
		panic(err)
	}
	defer nc.Close()

	js, err := configStream(nc)
	if err != nil {
		log.Fatalf("Errore creazione contesto JetStream: %v", err)
	}

	start(&js, consumerId, dbURL)
	nc.Drain()
}

func configStream(nc *nats.Conn) (nats.JetStreamContext, error) {
	streamConfig := &nats.StreamConfig{
		Name:     "CONSUMING_SENSORS",
		Subjects: []string{"sensors.>"},
		Sources: []*nats.StreamSource{
			{
				Name:          "ExportTenant1Data",
				FilterSubject: "sensors.tenant_1.>",
				External: &nats.ExternalStream{
					APIPrefix: "tenant_1.$JS.API",
				},
			},
			{
				Name:          "ExportTenant2Data",
				FilterSubject: "sensors.tenant_2.>",
				External: &nats.ExternalStream{
					APIPrefix: "tenant_2.$JS.API",
				},
			},
		},
		Retention: nats.WorkQueuePolicy,
	}

	js, err := nc.JetStream()
	if err != nil {
		return nil, fmt.Errorf("errore ottenimento JetStream: %v", err)
	}

	_, err = js.AddStream(streamConfig)
	if err != nil {
		return nil, fmt.Errorf("errore creazione stream: %v", err)
	}

	return js, nil
}

func unmurshallSpo2Data(data []byte) (sensor.PulseOxData, error) {
	var spO2Data sensor.PulseOxData
	err := json.Unmarshal(data, &spO2Data)
	if err != nil {
		return sensor.PulseOxData{}, err
	}

	return spO2Data, nil
}

func unmurshallHeartRateData(data []byte) (sensor.HearthRateData, error) {
	var hrData sensor.HearthRateData
	err := json.Unmarshal(data, &hrData)
	if err != nil {
		return sensor.HearthRateData{}, err
	}

	return hrData, nil
}

func getNatsConnection(natsURL string, servername string, credsPath string) (*nats.Conn, error) {
	opts := nats.GetDefaultOptions()
	opts.Url = natsURL

	certPool := x509.NewCertPool()
	caData, err := os.ReadFile("certs/ca.pem") //ca.pem da prendere da BITWARDEN
	if err != nil {
		log.Fatalf("Errore lettura file: %v", err)
	}
	if ok := certPool.AppendCertsFromPEM(caData); !ok {
		log.Fatal("Impossibile aggiungere il certificato CA al pool: il formato potrebbe essere errato")
	}

	opts.TLSConfig = &tls.Config{
		RootCAs:    certPool,
		ServerName: servername,
	}

	err = nats.UserCredentials(credsPath)(&opts)
	if err != nil {
		return nil, err
	}

	nc, err := opts.Connect()
	if err != nil {
		return nil, err
	}

	return nc, nil
}

func start(js *nats.JetStreamContext, consumerId string, dbURL string) {
	queueName := "sensor-subscribers"
	subject := "sensors.>"
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Push consumer(attuale): i messaggi vengono spinti verso i subscriber indipendentemente dalla loro disponibilità, con il rischio di sovraccaricarli
	// Pull consumer: i subscriber richiedono esplicitamente i messaggi al server, che li invia solo quando sono pronti a riceverli, evitando sovraccarichi
	sub, err := (*js).QueueSubscribe(subject, queueName, func(msg *nats.Msg) {
		subjectParts := strings.Split(msg.Subject, ".")
		if len(subjectParts) < 4 {
			fmt.Printf("Subject non valido: %s\n", msg.Subject)
			return
		}

		tenantId := subjectParts[1]
		gatewayId := subjectParts[2]
		tablename := subjectParts[3]

		switch tablename {
		case "heart_rate":
			hrData, err := unmurshallHeartRateData(msg.Data)
			if err != nil {
				fmt.Printf("Errore nel parsing dei dati di Heart Rate: %v\n", err)
				msg.Nak()
				return
			}
			err = dbaccess.InsertHeartRateData(tenantId, tablename, gatewayId, hrData, dbURL)
			if err != nil {
				fmt.Printf("Errore nell'inserimento dei dati di Heart Rate nel database: %v\n", err)
				return
			}
			msg.Ack()
		case "blood_oxygen":
			spO2Data, err := unmurshallSpo2Data(msg.Data)
			if err != nil {
				fmt.Printf("Errore nel parsing dei dati di SpO2: %v\n", err)
				return
			}
			err = dbaccess.InsertSpO2Data(tenantId, tablename, gatewayId, spO2Data, dbURL)
			if err != nil {
				fmt.Printf("Errore nell'inserimento dei dati di SpO2 nel database: %v\n", err)
				msg.Nak()
				return
			}
			msg.Ack()
		default:
			fmt.Printf("Tipo di dato non supportato: %s\n", tablename)
			return
		}

		fmt.Printf("Ricevuto su [%s], consumer%s: %s\n", msg.Subject, consumerId, string(msg.Data))
	}, nats.ManualAck())
	if err != nil {
		log.Fatal(err)
	}
	defer sub.Unsubscribe()

	fmt.Println("Client in ascolto... premi Ctrl+C per uscire")

	<-sigCh

	fmt.Println("\nChiusura in corso...")
}
