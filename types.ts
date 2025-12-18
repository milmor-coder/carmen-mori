export enum ServiceType {
  CATERING = 'Catering',
  WEDDING = 'Boda',
  CORPORATE = 'Corporativo',
  BIRTHDAY = 'Cumpleaños',
  OTHER = 'Otro'
}

export enum OrderStatus {
  PENDING = 'Pendiente',
  IN_PRODUCTION = 'En Producción',
  DELIVERED = 'Entregado',
  COMPLETED = 'Completado'
}

export interface ProductionItem {
  id: string;
  name: string;
  quantity: number;
  qcApproved?: boolean;
  qcNotes?: string;
}

export interface ProductionData {
  items: ProductionItem[];
  startDate: string | null; // ISO Date string
  lastQcDate?: string | null; // ISO Date string for QC
  notes?: string;
}

export interface DeliveryData {
  deliveryDate: string; // ISO Date string
  proofUrl?: string;
  itemsSnapshot: ProductionItem[]; // What was actually delivered
}

export interface Order {
  id: string;
  clientName: string;
  serviceType: ServiceType;
  headcount: number;
  eventDate: string;
  eventLocation: string;
  status: OrderStatus;
  production?: ProductionData;
  delivery?: DeliveryData;
  createdAt: string;
}