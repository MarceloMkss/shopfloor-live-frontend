
export interface Machine {
  id?: number;
  name: string;
  vendor: string;
  model: string;
  status: 'ACTIVE' | 'INACTIVE';
}
