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

	js, err := configStreams(nc, tenantID)
	if err != nil {
		log.Fatalf("Errore configurazione stream: %v", err)
	}

	start(&js, tenantID, gatewayId)
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

func configStreams(nc *nats.Conn, tenantId string) (nats.JetStreamContext, error) {
	streamName := "sensors_" + tenantId

	ONE_MONTH := 30 * 24 * time.Hour
	ONE_MB := int32(1024 * 1024)

	streamConfig := &nats.StreamConfig{
		Name:       streamName,
		Subjects:   []string{"sensors." + tenantId + ".>"},
		Storage:    nats.FileStorage,
		Replicas:   1, // Possibilità di scalare in futuro
		Retention:  nats.LimitsPolicy,
		MaxAge:     ONE_MONTH, // 30 giorni di conservazione dei messaggi
		MaxMsgSize: ONE_MB,    // Limite di 1 MB per messaggio
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

func start(js *nats.JetStreamContext, tenantId string, gatewayId string) {
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

		_, err = (*js).Publish("sensors."+tenantId+"."+gatewayId+".heart_rate", hrMsg)
		if err != nil {
			log.Fatalf("Errore pubblicazione messaggio: %v", err)
		}

		_, err = (*js).Publish("sensors."+tenantId+"."+gatewayId+".blood_oxygen", spO2Msg)
		if err != nil {
			log.Fatalf("Errore pubblicazione messaggio: %v", err)
		}

		fmt.Printf("Gateway %s sent Heart Rate: %d BPM, SpO2: %.1f%%\n", gatewayId, hrData.BPM, spO2Data.SpO2)

		time.Sleep(5 * time.Second)
	}
}
