package gateway

import (
	"encoding/json"
	"fmt"
	sensor "gateway/sensorData"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
)

func Init(natsURL string, tenantID string, serialGateway string, wg *sync.WaitGroup) {
	defer wg.Done()
	nc, err := nats.Connect(natsURL)
	if err != nil {
		panic(err)
	}
	defer nc.Close()

	start(nc, tenantID, serialGateway)
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
