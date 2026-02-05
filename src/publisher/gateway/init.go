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

func Init(natsURL string, tenantID string, gatewayId string, wg *sync.WaitGroup) {
	defer wg.Done()
	nc, err := getNatsConnection(natsURL, "glitchhubteam.it", gatewayId)
	if err != nil {
		panic(err)
	}
	defer nc.Close()

	start(nc, tenantID, gatewayId)
}

func getNatsConnection(natsURL string, servername string, gatewayId string) (*nats.Conn, error) {
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

	opts.AsyncErrorCB = func(nc *nats.Conn, sub *nats.Subscription, err error) {
		log.Printf("[ERRORE ASINCRONO] Gateway %s: %v", gatewayId, err)
	}

	opts.DisconnectedErrCB = func(nc *nats.Conn, err error) {
		log.Printf("Gateway %s disconnesso: %v", gatewayId, err)
	}

	credsPath := fmt.Sprintf("gateway/%s.creds", gatewayId)

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

func start(nc *nats.Conn, tenantID string, gatewayId string) {
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

		err = nc.Publish("sensors."+tenantID+"."+gatewayId+".heart_rate", hrMsg)
		if err != nil {
			log.Fatalf("Errore pubblicazione messaggio: %v", err)
		}
		err = nc.Publish("sensors."+tenantID+"."+gatewayId+".blood_oxygen", spO2Msg)
		if err != nil {
			log.Fatalf("Errore pubblicazione messaggio: %v", err)
		}

		fmt.Printf("Gateway %s sent Heart Rate: %d BPM, SpO2: %.1f%%\n", gatewayId, hrData.BPM, spO2Data.SpO2)

		time.Sleep(5 * time.Second)
	}
}
