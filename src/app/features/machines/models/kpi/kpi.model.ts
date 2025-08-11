export interface ProductionByMachineItem {
  machine: string;
  qty: number;
}

export interface ProductionKpi {
  productionByMachine: ProductionByMachineItem[]; // tabla izquierda
  alarmsByCode: Record<string, number>;           // tabla central (keyvalue)
  avgTemperature: number;                         // tarjeta derecha
}