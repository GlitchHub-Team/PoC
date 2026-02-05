package dbaccess

import (
	"context"
	"fmt"

	sensor "gateway/sensorData"

	"github.com/jackc/pgx/v5"
)

func isSupportedTablename(tablename string) bool {
	return tablename == "heart_rate" || tablename == "blood_oxygen"
}

func InsertHeartRateData(tenantId string, tablename string, gatewayId string, hrData sensor.HearthRateData) error {
	if !isSupportedTablename(tablename) {
		return fmt.Errorf("Tabella non supportata: %s", tablename)
	}

	tenantUsername := fmt.Sprintf("%s_user", tenantId)
	urlExample := fmt.Sprintf("postgres://%s:user@localhost:5432/sensors_db", tenantUsername)
	conn, err := pgx.Connect(context.Background(), urlExample)
	if err != nil {
		return fmt.Errorf("impossibile connettersi al database: %v", err)
	}
	defer conn.Close(context.Background())

	query := fmt.Sprintf("INSERT INTO %s (time, gateway_id, bpm) VALUES ($1, $2, $3)", tablename)
	tag, err := conn.Exec(context.Background(), query, hrData.Timestamp, gatewayId, hrData.BPM)

	if err != nil {
		return fmt.Errorf("Inserimento fallito: %v", err)
	}
	fmt.Printf("Inserimento riuscito: %d righe interessate\n", tag.RowsAffected())
	return nil
}

func InsertSpO2Data(tenantId string, tablename string, gatewayId string, spO2Data sensor.PulseOxData) error {
	if !isSupportedTablename(tablename) {
		return fmt.Errorf("Tabella non supportata: %s", tablename)
	}

	tenantUsername := fmt.Sprintf("%s_user", tenantId)
	urlExample := fmt.Sprintf("postgres://%s:user@localhost:5432/sensors_db", tenantUsername)
	conn, err := pgx.Connect(context.Background(), urlExample)
	if err != nil {
		return fmt.Errorf("impossibile connettersi al database: %v", err)
	}
	defer conn.Close(context.Background())

	query := fmt.Sprintf("INSERT INTO %s (time, gateway_id, spO2) VALUES ($1, $2, $3)", tablename)
	tag, err := conn.Exec(context.Background(), query, spO2Data.Timestamp, gatewayId, spO2Data.SpO2)

	if err != nil {
		return fmt.Errorf("Inserimento fallito: %v", err)
	}
	fmt.Printf("Inserimento riuscito: %d righe interessate\n", tag.RowsAffected())
	return nil
}
