// Model per i dati dei sensori
export interface Sensor {
  id: string;
  sensorType: string;
  unit: string;
}

export interface SensorResponse {
  sensors: Sensor[];
}

export interface SensorReading {
  time: string;
  value: number;
  gatewayId: string;
}
