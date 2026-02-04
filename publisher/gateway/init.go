package gateway

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	sensor "gateway/sensorData"
	"log"
	"os"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
)

func Init(natsURL string, tenantID string, serialGateway string, wg *sync.WaitGroup) {
	defer wg.Done()
	nc, err := getNatsConnection(natsURL, "glitchhubteam.it")
	if err != nil {
		panic(err)
	}
	defer nc.Close()

	start(nc, tenantID, serialGateway)
}

func getNatsConnection(natsURL string, servername string) (*nats.Conn, error) {
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

	nc, err := opts.Connect()
	if err != nil {
		return nil, err
	}

	return nc, nil
}

func start(nc *nats.Conn, tenantID string, serialGateway string) {
	for {
		hrData := sensor.SimulateHeartRate()
		spO2Data := sensor.SimulateSpO2()

		hrMsg, err := json.Marshal(hrData)
		if err != nil {
			panic(err)
		}

		spO2Msg, err := json.Marshal(spO2Data)
		if err != nil {
			panic(err)
		}

		nc.Publish("sensors."+tenantID+"."+serialGateway+".heart_rate", hrMsg)
		nc.Publish("sensors."+tenantID+"."+serialGateway+".blood_oxygen", spO2Msg)

		fmt.Printf("Gateway %s sent Heart Rate: %d BPM, SpO2: %.1f%%\n", serialGateway, hrData.BPM, spO2Data.SpO2)

		time.Sleep(5 * time.Second)
	}
}
