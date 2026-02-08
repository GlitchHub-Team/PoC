/**
 * Type custom per oggetto sensore, singolo reading e bundle storico
 */

export interface Sensor {
  id: string;
  name: string
  sensorType: string;
  unit: string;
}

export interface RawSensorReading {
  data: string;
  subject: string;
  timestamp: number;
}

export interface SensorReading {
  tenant: string;
  gateway: string;
  sensorType: string;
  data: any;
  value: number;
  timestamp: Date;
}

export interface HistoricDataResponse {
    readings: SensorReading[];
}
