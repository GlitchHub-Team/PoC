/**
 * Type custom per oggetto sensore, singolo reading e reading storico
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

export interface HistoryApiResponse {
  count: number;
  data: HistoricReading[];
}


export interface HistoricReading {
  time: string;
  gateway_id: string;
  [key: string]: any;  // Il reading del sensore
}
