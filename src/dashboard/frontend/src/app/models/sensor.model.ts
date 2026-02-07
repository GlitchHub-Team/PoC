/**
 * Type custom per oggetto sensore, singolo reading e bundle storico
 */

export interface Sensor {
  id: string;
  name: string
  sensorType: string;
  unit: string;
}

export interface SensorReading {
  time: string;
  value: number;
  gatewayId: string;
}

export interface HistoricDataResponse {
    readings: SensorReading[];
}
