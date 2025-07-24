export interface CartResponse {
  id: number;
  usuario: number;
  activo: boolean;
  detalles: CartDetail[];
  total_original: string;
  ahorro_por_ofertas: string;
  cantidad_productos: number;
  cantidad_items: number;
  resumen_ofertas: Record<string, any>;
}

export interface CartDetail {
  id: number;
  producto: BookCartInfo;
  cantidad: number;
  precio_unitario: string;
  precio_original: string;
  descuento_oferta: string;
  nombre_oferta?: string;
  fecha_oferta_aplicada?: string;
  subtotal: string;
  is_active: boolean; // Ahora sabemos que SÍ debe venir del backend
  ahorro_por_oferta: string;
  subtotal_original: string;
  tiene_oferta: boolean;
  oferta_vigente?: Record<string, any>;
}

export interface BookCartInfo {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  imagen?: string;
}

export interface OfertaVigente {
  vigente: boolean;
  nombre?: string;
  descuento?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
