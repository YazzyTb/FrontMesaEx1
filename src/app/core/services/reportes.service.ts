import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

// Interfaces (igual que antes)

export interface ProductoVendido {
  producto__id: number;
  producto__nombre: string;
  producto__precio: number;
  producto__stock: number;
  cantidad_vendida: number;
  veces_comprado: number;
  ingreso_total: number;
  precio_promedio_venta: number;
}

export interface VentaPeriodo {
  periodo: string;
  total_pedidos: number;
  total_ingresos: number;
  total_productos_vendidos: number;
  ingreso_promedio_pedido: number;
  descuento_promedio: number;
}

export interface ResumenVentasGeneral {
  total_pedidos: number;
  total_ingresos: number;
  ingreso_promedio: number;
  descuento_promedio: number;
  total_productos_vendidos: number;
  productos_unicos_vendidos: number;
  clientes_unicos: number;
}

export interface ClienteTop {
  usuario__id: number;
  usuario__nombre_completo: string;
  usuario__email: string;
  total_pedidos: number;
  total_gastado: number;
  gasto_promedio: number;
  total_productos_comprados: number;
}

export interface EfectividadOfertas {
  productos_con_ofertas: OfertaEfectividadProducto[];
  productos_sin_ofertas: OfertaEfectividadProducto[];
}

export interface OfertaEfectividadProducto {
  producto__id: number;
  producto__nombre: string;
  nombre_oferta?: string;
  cantidad_vendida: number;
  ingreso_con_descuento?: number;
  ingreso_total?: number; // Para productos sin ofertas
  ahorro_total_clientes?: number;
  ventas_count: number;
}

export interface ComparativaPeriodo {
  periodo_1: {
    fecha_inicio: string;
    fecha_fin: string;
    datos: ResumenVentasGeneral;
  };
  periodo_2: {
    fecha_inicio: string;
    fecha_fin: string;
    datos: ResumenVentasGeneral;
  };
  comparativa: {
    [key: string]: {
      periodo_1: number;
      periodo_2: number;
      diferencia: number;
      porcentaje_cambio: number;
    };
  };
}

export interface DashboardMetricas {
  total_pedidos: number;
  total_ingresos: number;
  ingreso_promedio: number;
  descuento_promedio: number;
  total_productos_vendidos: number;
  productos_unicos_vendidos: number;
  clientes_unicos: number;
}

export interface DashboardComparacion {
  hoy: number;
  ayer: number;
  diferencia: number;
}

export interface DashboardResponse {
  fecha_actualizacion: string;
  metricas: {
    hoy: DashboardMetricas;
    ayer: DashboardMetricas;
    ultima_semana: DashboardMetricas;
    ultimo_mes: DashboardMetricas;
  };
  top_productos_mes: ProductoVendido[];
  top_clientes_mes: ClienteTop[];
  ventas_ultimos_7_dias: VentaPeriodo[];
  comparaciones: {
    pedidos_hoy_vs_ayer: DashboardComparacion;
    ingresos_hoy_vs_ayer: DashboardComparacion;
  };
}

// Interfaces para las respuestas envueltas del backend
export interface ProductosVendidosResponse {
  productos: ProductoVendido[];
  parametros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    limite: number;
  };
  total_registros: number;
}

export interface VentasPeriodoResponse {
  ventas: VentaPeriodo[];
  parametros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    agrupar_por: string;
  };
  total_periodos: number;
}

export interface ResumenGeneralResponse {
  resumen: ResumenVentasGeneral;
  parametros: {
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

export interface TopClientesResponse {
  clientes: ClienteTop[];
  parametros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    limite: number;
  };
  total_registros: number;
}

export interface EfectividadOfertasResponse {
  efectividad: EfectividadOfertas;
  parametros: {
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

export interface ReporteRapidoResponse {
  periodo: string;
  rango_fechas: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  resumen_general: ResumenVentasGeneral;
  productos_mas_vendidos: ProductoVendido[];
  top_clientes: ClienteTop[];
  ventas_por_dia: VentaPeriodo[];
  efectividad_ofertas: EfectividadOfertas;
}

// Interface para guardar reportes (opcional, basada en el modelo del backend)
export interface ReporteGuardado {
  id?: number;
  tipo_reporte: 'productos_vendidos' | 'ventas_periodo' | 'resumen_general' | 'top_clientes' | 'efectividad_ofertas' | 'comparativa';
  nombre: string;
  parametros: any;
  datos: any;
  fecha_generacion?: string;
  generado_por?: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}reportes/`;

  constructor(private http: HttpClient) {}

  getProductosMasVendidos(fechaInicio?: string, fechaFin?: string, limite?: number): Observable<ProductosVendidosResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    if (limite) params = params.set('limite', limite.toString());
    
    return this.http.get<ProductosVendidosResponse>(`${this.apiUrl}productos-mas-vendidos/`, { params });
  }

  getResumenVentasPorPeriodo(fechaInicio?: string, fechaFin?: string, agruparPor?: string): Observable<VentasPeriodoResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    if (agruparPor) params = params.set('agrupar_por', agruparPor);
    
    return this.http.get<VentasPeriodoResponse>(`${this.apiUrl}ventas-por-periodo/`, { params });
  }

  getResumenGeneral(fechaInicio?: string, fechaFin?: string): Observable<ResumenGeneralResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    
    return this.http.get<ResumenGeneralResponse>(`${this.apiUrl}resumen-general/`, { params });
  }

  getClientesTop(fechaInicio?: string, fechaFin?: string, limite?: number): Observable<TopClientesResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    if (limite) params = params.set('limite', limite.toString());
    
    return this.http.get<TopClientesResponse>(`${this.apiUrl}top-clientes/`, { params });
  }

  getOfertasMasEfectivas(fechaInicio?: string, fechaFin?: string): Observable<EfectividadOfertasResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    
    return this.http.get<EfectividadOfertasResponse>(`${this.apiUrl}efectividad-ofertas/`, { params });
  }

  // Método para reporte rápido (método POST)
  getReporteRapido(parametros: any): Observable<ReporteRapidoResponse> {
    return this.http.post<ReporteRapidoResponse>(`${this.apiUrl}reporte-rapido/`, parametros);
  }

  // Métodos de exportación
  exportarPDF(parametros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}exportar-pdf/`, parametros, {
      responseType: 'blob'
    });
  }

  exportarExcel(parametros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}exportar-excel/`, parametros, {
      responseType: 'blob'
    });
  }

  exportarCSV(parametros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}exportar-csv/`, parametros, {
      responseType: 'blob'
    });
  }

  compararPeriodos(
    fechaInicio1: string,
    fechaFin1: string,
    fechaInicio2: string,
    fechaFin2: string
  ): Observable<ComparativaPeriodo> {
    // POST al endpoint comparativa-periodos
    const body = {
      fecha_inicio_1: fechaInicio1,
      fecha_fin_1: fechaFin1,
      fecha_inicio_2: fechaInicio2,
      fecha_fin_2: fechaFin2,
    };
    return this.http.post<ComparativaPeriodo>(`${this.apiUrl}comparativa-periodos/`, body);
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}dashboard/`);
  }
}
