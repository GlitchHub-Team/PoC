package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"

	sensor "gateway/sensorData"
	dbaccess "subscriber/db-access"

	"github.com/nats-io/nats.go"
)

func InitSubscriber(natsURL string, consumerId string, wg *sync.WaitGroup) {
	defer wg.Done()

	nc, err := nats.Connect(natsURL)
	if err != nil {
		panic(err)
	}
	defer nc.Close()

	start(nc, consumerId)
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

func start(nc *nats.Conn, consumerId string) {
	queueName := "sensor-subscribers"
	subject := "sensors.>"
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	sub, err := nc.QueueSubscribe(subject, queueName, func(msg *nats.Msg) {
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
				return
			}
			err = dbaccess.InsertHeartRateData(tenantId, tablename, gatewayId, hrData)
			if err != nil {
				fmt.Printf("Errore nell'inserimento dei dati di Heart Rate nel database: %v\n", err)
				return
			}
		case "blood_oxygen":
			spO2Data, err := unmurshallSpo2Data(msg.Data)
			if err != nil {
				fmt.Printf("Errore nel parsing dei dati di SpO2: %v\n", err)
				return
			}
			err = dbaccess.InsertSpO2Data(tenantId, tablename, gatewayId, spO2Data)
			if err != nil {
				fmt.Printf("Errore nell'inserimento dei dati di SpO2 nel database: %v\n", err)
				return
			}
		default:
			fmt.Printf("Tipo di dato non supportato: %s\n", tablename)
			return
		}

		fmt.Printf("Ricevuto su [%s], consumer%s: %s\n", msg.Subject, consumerId, string(msg.Data))
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
