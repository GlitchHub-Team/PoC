package sensor

import (
	"math"
	"math/rand"
	"time"
)

type HearthRateData struct {
	BPM       int       `json:"bpm"`
	Timestamp time.Time `json:"timestamp"`
}

type PulseOxData struct {
	SpO2      float64   `json:"spO2"`
	Timestamp time.Time `json:"timestamp"`
}

func SimulateHeartRate() HearthRateData {
	maxHR := 140
	minHR := 55
	hr := rand.Intn(maxHR-minHR) + minHR
	return HearthRateData{BPM: hr, Timestamp: time.Now()}
}

func SimulateSpO2() PulseOxData {
	maxSpO2 := 100.0
	minSpO2 := 90.0
	spO2 := minSpO2 + rand.Float64()*(maxSpO2-minSpO2)
	return PulseOxData{SpO2: math.Round(spO2*10) / 10, Timestamp: time.Now()}
}
