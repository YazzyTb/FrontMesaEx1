import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import {
  ReportesService,
  ProductoVendido,
  VentaPeriodo,
  ResumenVentasGeneral,
  ClienteTop,
  EfectividadOfertas,
  ComparativaPeriodo,
  DashboardResponse,
  ProductosVendidosResponse,
  VentasPeriodoResponse,
  ResumenGeneralResponse,
  TopClientesResponse,
  EfectividadOfertasResponse,
} from '../../core/services/reportes.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnInit {
  // Variables para filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  limite: number = 10;
  agruparPor: string = 'dia';
  tipoReporte: string = 'dashboard'; // Cambiado a dashboard para ver métricas principales

  // Variables para comparativa de períodos
  fechaInicio1: string = '';
  fechaFin1: string = '';
  fechaInicio2: string = '';
  fechaFin2: string = '';

  // Variables para almacenar datos de reportes
  productosMasVendidosResponse: ProductosVendidosResponse | null = null;
  ventasPorPeriodoResponse: VentasPeriodoResponse | null = null;
  resumenGeneralResponse: ResumenGeneralResponse | null = null;
  clientesTopResponse: TopClientesResponse | null = null;
  efectividadOfertasResponse: EfectividadOfertasResponse | null = null;
  comparativaPeriodos: ComparativaPeriodo | null = null;
  dashboardData: DashboardResponse | null = null;

  // Para acceso rápido a los datos desde las templates
  get productosMasVendidos(): ProductoVendido[] {
    return this.productosMasVendidosResponse?.productos || [];
  }

  get ventasPorPeriodo(): VentaPeriodo[] {
    return this.ventasPorPeriodoResponse?.ventas || [];
  }

  get resumenGeneral(): ResumenVentasGeneral | null {
    return this.resumenGeneralResponse?.resumen || null;
  }

  get clientesTop(): ClienteTop[] {
    return this.clientesTopResponse?.clientes || [];
  }

  get efectividadOfertas(): EfectividadOfertas | null {
    return this.efectividadOfertasResponse?.efectividad || null;
  }

  // Métodos helper para debugging
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Método para obtener las keys de la comparativa
  obtenerComparativaKeys(): string[] {
    if (!this.comparativaPeriodos?.comparativa) return [];
    return Object.keys(this.comparativaPeriodos.comparativa);
  }

  // Método para obtener el label de la métrica
  obtenerLabelMetrica(key: string): string {
    const labels: { [key: string]: string } = {
      'total_pedidos': 'Total de Pedidos',
      'total_ingresos': 'Total de Ingresos',
      'ingreso_promedio': 'Ingreso Promedio',
      'descuento_promedio': 'Descuento Promedio',
      'total_productos_vendidos': 'Total Productos Vendidos',
      'productos_unicos_vendidos': 'Productos Únicos Vendidos',
      'clientes_unicos': 'Clientes Únicos'
    };
    return labels[key] || key;
  }

  // Variables de control
  isLoading: boolean = false;
  reporteActual: string = '';
  mostrarComparativa: boolean = false;

  // Opciones para select
  tiposReporte = [
    { value: 'dashboard', label: 'Dashboard General' },
    { value: 'productos_vendidos', label: 'Productos Más Vendidos' },
    { value: 'ventas_periodo', label: 'Ventas por Período' },
    { value: 'resumen_general', label: 'Resumen General' },
    { value: 'top_clientes', label: 'Top Clientes' },
    { value: 'efectividad_ofertas', label: 'Efectividad de Ofertas' },
   // { value: 'comparativa_periodos', label: 'Comparativa de Períodos' }
  ];

  opcionesAgrupar = [
    { value: 'dia', label: 'Por Día' },
    { value: 'semana', label: 'Por Semana' },
    { value: 'mes', label: 'Por Mes' },
    { value: 'año', label: 'Por Año' }
  ];

  constructor(
    private reportesService: ReportesService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🚀 ReportesComponent inicializando...');
    this.establecerFechasPorDefecto();
    console.log('📅 Fechas establecidas:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });
    
    // Consultar el reporte por defecto al inicializar
    this.consultarReporte();
  }

  establecerFechasPorDefecto(): void {
    const hoy = new Date();
    // Expandiendo el rango a 6 meses para capturar más datos
    const hace6Meses = new Date(hoy.getTime() - (180 * 24 * 60 * 60 * 1000));
    
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace6Meses.toISOString().split('T')[0];
    
    console.log('📅 Fechas expandidas para capturar más datos:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });
    
    // Para comparativa
    const hace1Año = new Date(hoy.getTime() - (360 * 24 * 60 * 60 * 1000));
    this.fechaFin1 = this.fechaFin;
    this.fechaInicio1 = this.fechaInicio;
    this.fechaFin2 = hace6Meses.toISOString().split('T')[0];
    this.fechaInicio2 = hace1Año.toISOString().split('T')[0];
  }

  onTipoReporteChange(): void {
    this.mostrarComparativa = this.tipoReporte === 'comparativa_periodos';
    this.limpiarDatos();
    
    // Si se selecciona comparativa, establecer fechas por defecto
    if (this.tipoReporte === 'comparativa_periodos') {
      this.establecerFechasPorDefectoComparativa();
    }
  }

  private establecerFechasPorDefectoComparativa(): void {
    const hoy = new Date();
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);
    const hace60dias = new Date();
    hace60dias.setDate(hace60dias.getDate() - 60);

    // Período 1: Últimos 30 días
    this.fechaFin1 = hoy.toISOString().split('T')[0];
    this.fechaInicio1 = hace30dias.toISOString().split('T')[0];

    // Período 2: 30 días anteriores a los últimos 30 días
    this.fechaFin2 = hace30dias.toISOString().split('T')[0];
    this.fechaInicio2 = hace60dias.toISOString().split('T')[0];

    console.log('📅 Fechas por defecto establecidas:', {
      periodo1: `${this.fechaInicio1} a ${this.fechaFin1}`,
      periodo2: `${this.fechaInicio2} a ${this.fechaFin2}`
    });
  }

  limpiarDatos(): void {
    this.productosMasVendidosResponse = null;
    this.ventasPorPeriodoResponse = null;
    this.resumenGeneralResponse = null;
    this.clientesTopResponse = null;
    this.efectividadOfertasResponse = null;
    this.comparativaPeriodos = null;
    this.dashboardData = null;
    this.reporteActual = '';
  }

  consultarReporte(): void {
    console.log('=== INICIANDO CONSULTA DE REPORTE ===');
    console.log('Tipo de reporte:', this.tipoReporte);
    console.log('Fecha inicio:', this.fechaInicio);
    console.log('Fecha fin:', this.fechaFin);
    console.log('Límite:', this.limite);
    console.log('Token de autenticación:', sessionStorage.getItem('token') ? 'Presente' : 'Ausente');
    
    // El dashboard no necesita validación de fechas
    if (this.tipoReporte !== 'dashboard' && !this.validarFechas()) {
      console.log('Validación de fechas falló');
      return;
    }

    this.isLoading = true;
    this.limpiarDatos();
    this.reporteActual = this.tipoReporte;
    
    console.log('Reporte actual establecido:', this.reporteActual);

    switch (this.tipoReporte) {
      case 'dashboard':
        console.log('Consultando dashboard...');
        this.consultarDashboard();
        break;
      case 'productos_vendidos':
        console.log('Consultando productos más vendidos...');
        this.consultarProductosMasVendidos();
        break;
      case 'ventas_periodo':
        console.log('Consultando ventas por período...');
        this.consultarVentasPorPeriodo();
        break;
      case 'resumen_general':
        console.log('Consultando resumen general...');
        this.consultarResumenGeneral();
        break;
      case 'top_clientes':
        console.log('Consultando top clientes...');
        this.consultarTopClientes();
        break;
      case 'efectividad_ofertas':
        console.log('Consultando efectividad ofertas...');
        this.consultarEfectividadOfertas();
        break;
      case 'comparativa_periodos':
        console.log('Consultando comparativa períodos...');
        this.consultarComparativaPeriodos();
        break;
      default:
        this.isLoading = false;
        console.log('Tipo de reporte no válido:', this.tipoReporte);
        Swal.fire('Error', 'Tipo de reporte no válido', 'error');
    }
  }

  private consultarDashboard(): void {
    console.log('--- Consultando dashboard ---');
    console.log('URL que se va a llamar:', `${this.reportesService['apiUrl']}dashboard/`);
    
    this.reportesService.getDashboard()
      .subscribe({
        next: (data) => {
          console.log('✅ Dashboard recibido:', data);
          
          if (data) {
            this.dashboardData = data;
            console.log('✅ Dashboard asignado correctamente');
          } else {
            console.log('⚠️ No se recibió dashboard del backend');
            this.dashboardData = null;
          }
          
          this.isLoading = false;
          console.log('Estado final dashboard:', {
            reporteActual: this.reporteActual,
            hayDatos: this.hayDatos(),
            isLoading: this.isLoading,
            dashboard: this.dashboardData
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error al consultar dashboard:', error);
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('URL:', error.url);
          
          if (error.status === 0) {
            Swal.fire('Error de Conexión', 'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.', 'error');
          } else if (error.status === 404) {
            Swal.fire('Error 404', 'El endpoint de dashboard no fue encontrado.', 'error');
          } else {
            Swal.fire('Error', `Error del servidor: ${error.message}`, 'error');
          }
        }
      });
  }

  private consultarProductosMasVendidos(): void {
    const fechaInicio = this.fechaInicio || undefined;
    const fechaFin = this.fechaFin || undefined;
    
    console.log('--- Consultando productos más vendidos ---');
    console.log('Parámetros:', { fechaInicio, fechaFin, limite: this.limite });
    console.log('URL que se va a llamar:', `${this.reportesService['apiUrl']}productos-mas-vendidos/`);
    
    this.reportesService.getProductosMasVendidos(fechaInicio, fechaFin, this.limite)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta completa del backend:', response);
          
          this.productosMasVendidosResponse = response;
          console.log('✅ Productos asignados correctamente');
          
          if (response.productos && response.productos.length > 0) {
            console.log(`📊 ${response.productos.length} productos cargados`);
          } else {
            console.log('⚠️ No se recibieron productos del backend');
          }
          
          this.isLoading = false;
          console.log('Estado final:', {
            reporteActual: this.reporteActual,
            hayDatos: this.hayDatos(),
            isLoading: this.isLoading,
            cantidadProductos: this.productosMasVendidos.length
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error completo:', error);
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('URL:', error.url);
          console.error('Message:', error.message);
          
          if (error.status === 0) {
            Swal.fire('Error de Conexión', 'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.', 'error');
          } else if (error.status === 404) {
            Swal.fire('Error 404', 'El endpoint de reportes no fue encontrado. Verifique la URL del backend.', 'error');
          } else {
            Swal.fire('Error', `Error del servidor: ${error.message}`, 'error');
          }
        }
      });
  }

  private consultarVentasPorPeriodo(): void {
    const fechaInicio = this.fechaInicio || undefined;
    const fechaFin = this.fechaFin || undefined;
    
    this.reportesService.getResumenVentasPorPeriodo(fechaInicio, fechaFin, this.agruparPor)
      .subscribe({
        next: (response) => {
          this.ventasPorPeriodoResponse = response;
          this.isLoading = false;
          console.log('Ventas por período:', response);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al consultar ventas por período:', error);
          Swal.fire('Error', 'No se pudieron cargar las ventas por período', 'error');
        }
      });
  }

  private consultarResumenGeneral(): void {
    const fechaInicio = this.fechaInicio || undefined;
    const fechaFin = this.fechaFin || undefined;
    
    console.log('--- Consultando resumen general ---');
    console.log('Parámetros:', { fechaInicio, fechaFin });
    console.log('URL que se va a llamar:', `${this.reportesService['apiUrl']}resumen-general/`);
    
    this.reportesService.getResumenGeneral(fechaInicio, fechaFin)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta completa del backend:', response);
          
          this.resumenGeneralResponse = response;
          console.log('✅ Resumen asignado correctamente:', response);
          
          this.isLoading = false;
          console.log('Estado final resumen:', {
            reporteActual: this.reporteActual,
            hayDatos: this.hayDatos(),
            isLoading: this.isLoading,
            resumen: this.resumenGeneral
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error al consultar resumen general:', error);
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('URL:', error.url);
          
          if (error.status === 0) {
            Swal.fire('Error de Conexión', 'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.', 'error');
          } else if (error.status === 404) {
            Swal.fire('Error 404', 'El endpoint de resumen general no fue encontrado.', 'error');
          } else {
            Swal.fire('Error', `Error del servidor: ${error.message}`, 'error');
          }
        }
      });
  }

  private consultarTopClientes(): void {
    const fechaInicio = this.fechaInicio || undefined;
    const fechaFin = this.fechaFin || undefined;
    
    this.reportesService.getClientesTop(fechaInicio, fechaFin, this.limite)
      .subscribe({
        next: (response) => {
          this.clientesTopResponse = response;
          this.isLoading = false;
          console.log('Top clientes:', response);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al consultar top clientes:', error);
          Swal.fire('Error', 'No se pudieron cargar los top clientes', 'error');
        }
      });
  }

  private consultarEfectividadOfertas(): void {
    const fechaInicio = this.fechaInicio || undefined;
    const fechaFin = this.fechaFin || undefined;
    
    console.log('--- Consultando efectividad de ofertas ---');
    console.log('Parámetros:', { fechaInicio, fechaFin });
    
    this.reportesService.getOfertasMasEfectivas(fechaInicio, fechaFin)
      .subscribe({
        next: (response) => {
          this.efectividadOfertasResponse = response;
          this.isLoading = false;
          
          console.log('✅ Respuesta completa efectividad ofertas:', response);
          console.log('📊 Productos con ofertas:', response.efectividad?.productos_con_ofertas?.length || 0);
          console.log('📊 Productos sin ofertas:', response.efectividad?.productos_sin_ofertas?.length || 0);
          
          if (response.efectividad) {
            console.log('🟢 Datos productos con ofertas:', response.efectividad.productos_con_ofertas);
            console.log('🔵 Datos productos sin ofertas:', response.efectividad.productos_sin_ofertas);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al consultar efectividad de ofertas:', error);
          Swal.fire('Error', 'No se pudo cargar la efectividad de ofertas', 'error');
        }
      });
  }

  private consultarComparativaPeriodos(): void {
    console.log('--- Consultando comparativa de períodos ---');
    console.log('Parámetros:', {
      fechaInicio1: this.fechaInicio1,
      fechaFin1: this.fechaFin1,
      fechaInicio2: this.fechaInicio2,
      fechaFin2: this.fechaFin2
    });

    if (!this.validarFechasComparativa()) {
      this.isLoading = false;
      return;
    }

    this.reportesService.compararPeriodos(this.fechaInicio1, this.fechaFin1, this.fechaInicio2, this.fechaFin2)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta completa comparativa:', response);
          this.comparativaPeriodos = response;
          this.isLoading = false;
          
          if (response.comparativa) {
            console.log('📊 Datos de comparativa:', response.comparativa);
            console.log('📅 Período 1:', response.periodo_1);
            console.log('📅 Período 2:', response.periodo_2);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error al consultar comparativa de períodos:', error);
          Swal.fire('Error', 'No se pudo cargar la comparativa de períodos', 'error');
        }
      });
  }

  // Métodos de descarga
  descargarPDF(): void {
    console.log('📄 Generando PDF localmente...');
    
    if (!this.hayDatos()) {
      Swal.fire('Advertencia', 'No hay datos para descargar. Consulte un reporte primero.', 'warning');
      return;
    }

    try {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espere mientras se crea el archivo',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString('es-ES');
      
      // Configurar título y encabezado
      doc.setFontSize(20);
      doc.text('Reporte de Ventas', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Tipo: ${this.obtenerNombreTipoReporte()}`, 14, 32);
      doc.text(`Fecha de generación: ${fechaActual}`, 14, 40);
      
      if (this.fechaInicio && this.fechaFin) {
        doc.text(`Período: ${this.fechaInicio} a ${this.fechaFin}`, 14, 48);
      }

      let yPosition = 60;

      // Generar contenido según el tipo de reporte
      switch (this.reporteActual) {
        case 'productos_vendidos':
          yPosition = this.generarTablaPDFProductos(doc, yPosition);
          break;
        case 'ventas_periodo':
          yPosition = this.generarTablaPDFVentas(doc, yPosition);
          break;
        case 'top_clientes':
          yPosition = this.generarTablaPDFClientes(doc, yPosition);
          break;
        case 'resumen_general':
          yPosition = this.generarPDFResumen(doc, yPosition);
          break;
        case 'efectividad_ofertas':
          yPosition = this.generarPDFEfectividadOfertas(doc, yPosition);
          break;
        case 'dashboard':
          yPosition = this.generarPDFDashboard(doc, yPosition);
          break;
        default:
          doc.text('Datos del reporte no disponibles para PDF', 14, yPosition);
      }

      // Descargar el archivo
      const filename = `reporte_${this.reporteActual}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      Swal.close();
      Swal.fire('Éxito', 'PDF generado exitosamente', 'success');
      
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      Swal.close();
      Swal.fire('Error', 'Error al generar el PDF', 'error');
    }
  }

  descargarExcel(): void {
    console.log('📊 Generando Excel localmente...');
    
    if (!this.hayDatos()) {
      Swal.fire('Advertencia', 'No hay datos para descargar. Consulte un reporte primero.', 'warning');
      return;
    }

    try {
      Swal.fire({
        title: 'Generando Excel...',
        text: 'Por favor espere mientras se crea el archivo',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const workbook = XLSX.utils.book_new();
      
      // Crear hoja según el tipo de reporte
      switch (this.reporteActual) {
        case 'productos_vendidos':
          this.agregarHojaProductos(workbook);
          break;
        case 'ventas_periodo':
          this.agregarHojaVentas(workbook);
          break;
        case 'top_clientes':
          this.agregarHojaClientes(workbook);
          break;
        case 'resumen_general':
          this.agregarHojaResumen(workbook);
          break;
        case 'efectividad_ofertas':
          this.agregarHojaEfectividadOfertas(workbook);
          break;
        case 'dashboard':
          this.agregarHojaDashboard(workbook);
          break;
        default:
          // Crear hoja vacía con mensaje
          const wsData = [['No hay datos disponibles para este tipo de reporte']];
          const ws = XLSX.utils.aoa_to_sheet(wsData);
          XLSX.utils.book_append_sheet(workbook, ws, 'Reporte');
      }

      // Descargar el archivo
      const filename = `reporte_${this.reporteActual}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      Swal.close();
      Swal.fire('Éxito', 'Excel generado exitosamente', 'success');
      
    } catch (error) {
      console.error('❌ Error al generar Excel:', error);
      Swal.close();
      Swal.fire('Error', 'Error al generar el Excel', 'error');
    }
  }

  descargarCSV(): void {
    if (!this.hayDatos()) {
      Swal.fire('Advertencia', 'No hay datos para descargar. Consulte un reporte primero.', 'warning');
      return;
    }

    const parametros = this.construirParametrosReporte();
    
    this.reportesService.exportarCSV(parametros).subscribe({
      next: (blob) => {
        this.descargarArchivoBlob(blob, `reporte_${this.reporteActual}_${new Date().toISOString().split('T')[0]}.csv`);
      },
      error: (error) => {
        console.error('Error al descargar CSV:', error);
        // Fallback: usar generación local de CSV
        this.descargarCSVLocal();
      }
    });
  }

  private descargarCSVLocal(): void {
    let csvContent = '';
    let filename = '';

    switch (this.reporteActual) {
      case 'productos_vendidos':
        csvContent = this.generarCSVProductos();
        filename = 'productos_mas_vendidos.csv';
        break;
      case 'ventas_periodo':
        csvContent = this.generarCSVVentas();
        filename = 'ventas_por_periodo.csv';
        break;
      case 'top_clientes':
        csvContent = this.generarCSVClientes();
        filename = 'top_clientes.csv';
        break;
      default:
        Swal.fire('Info', 'Descarga CSV no disponible para este tipo de reporte', 'info');
        return;
    }

    this.descargarArchivo(csvContent, filename, 'text/csv');
  }

  private generarCSVProductos(): string {
    const headers = ['ID', 'Nombre', 'Precio', 'Stock', 'Cantidad Vendida', 'Veces Comprado', 'Ingreso Total', 'Precio Promedio'];
    const rows = this.productosMasVendidos.map(p => [
      p.producto__id,
      p.producto__nombre,
      p.producto__precio,
      p.producto__stock,
      p.cantidad_vendida,
      p.veces_comprado,
      p.ingreso_total,
      p.precio_promedio_venta
    ]);
    
    return this.convertirACSV([headers, ...rows]);
  }

  private generarCSVVentas(): string {
    const headers = ['Período', 'Total Pedidos', 'Total Ingresos', 'Total Productos', 'Ingreso Promedio', 'Descuento Promedio'];
    const rows = this.ventasPorPeriodo.map(v => [
      v.periodo,
      v.total_pedidos,
      v.total_ingresos,
      v.total_productos_vendidos,
      v.ingreso_promedio_pedido,
      v.descuento_promedio
    ]);
    
    return this.convertirACSV([headers, ...rows]);
  }

  private generarCSVClientes(): string {
    const headers = ['ID', 'Nombre', 'Email', 'Total Pedidos', 'Total Gastado', 'Gasto Promedio', 'Productos Comprados'];
    const rows = this.clientesTop.map(c => [
      c.usuario__id,
      c.usuario__nombre_completo,
      c.usuario__email,
      c.total_pedidos,
      c.total_gastado,
      c.gasto_promedio,
      c.total_productos_comprados
    ]);
    
    return this.convertirACSV([headers, ...rows]);
  }

  private convertirACSV(data: any[][]): string {
    return data.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field}"` 
          : field
      ).join(',')
    ).join('\n');
  }

  private descargarArchivoBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    Swal.fire('Éxito', `Archivo ${filename} descargado exitosamente`, 'success');
  }

  private construirParametrosReporte(): any {
    return {
      tipo_reporte: this.reporteActual,
      fecha_inicio: this.fechaInicio || undefined,
      fecha_fin: this.fechaFin || undefined,
      limite: this.limite,
      agrupar_por: this.agruparPor
    };
  }

  private descargarArchivo(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    Swal.fire('Éxito', `Archivo ${filename} descargado exitosamente`, 'success');
  }

  // Métodos de utilidad
  private validarFechas(): boolean {
    if (this.tipoReporte === 'comparativa_periodos') {
      return this.validarFechasComparativa();
    }

    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      Swal.fire('Error', 'La fecha de inicio no puede ser mayor que la fecha de fin', 'error');
      return false;
    }
    return true;
  }

  private validarFechasComparativa(): boolean {
    if (!this.fechaInicio1 || !this.fechaFin1 || !this.fechaInicio2 || !this.fechaFin2) {
      Swal.fire('Error', 'Todas las fechas son requeridas para la comparativa', 'error');
      return false;
    }

    if (this.fechaInicio1 > this.fechaFin1 || this.fechaInicio2 > this.fechaFin2) {
      Swal.fire('Error', 'Las fechas de inicio no pueden ser mayores que las fechas de fin', 'error');
      return false;
    }

    return true;
  }

  hayDatos(): boolean {
    switch (this.reporteActual) {
      case 'dashboard':
        return this.dashboardData !== null;
      case 'productos_vendidos':
        return this.productosMasVendidos.length > 0;
      case 'ventas_periodo':
        return this.ventasPorPeriodo.length > 0;
      case 'resumen_general':
        return this.resumenGeneral !== null;
      case 'top_clientes':
        return this.clientesTop.length > 0;
      case 'efectividad_ofertas':
        return this.efectividadOfertas !== null;
      case 'comparativa_periodos':
        return this.comparativaPeriodos !== null;
      default:
        return false;
    }
  }

  // Métodos de utilidad para el template
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor || 0);
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-ES').format(valor || 0);
  }

  formatearPorcentaje(valor: number): string {
    return `${(valor || 0).toFixed(2)}%`;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  obtenerClasePorcentaje(porcentaje: number): string {
    if (porcentaje > 0) return 'text-green-600';
    if (porcentaje < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  obtenerIconoPorcentaje(porcentaje: number): string {
    if (porcentaje > 0) return '↗';
    if (porcentaje < 0) return '↘';
    return '→';
  }

  comparativaKeys(): string[] {
    return this.comparativaPeriodos ? Object.keys(this.comparativaPeriodos.comparativa) : [];
  }

  // Métodos adicionales para el template
  formatearClave(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }

  obtenerValorAbsoluto(valor: number): number {
    return Math.abs(valor || 0);
  }

  // Métodos auxiliares para generación de PDF y Excel
  private obtenerNombreTipoReporte(): string {
    const tipos = {
      'dashboard': 'Dashboard General',
      'productos_vendidos': 'Productos Más Vendidos',
      'ventas_periodo': 'Ventas por Período',
      'resumen_general': 'Resumen General de Ventas',
      'top_clientes': 'Top Clientes',
      'efectividad_ofertas': 'Efectividad de Ofertas',
      'comparativa_periodos': 'Comparativa de Períodos'
    };
    return tipos[this.reporteActual as keyof typeof tipos] || 'Reporte';
  }

  // Métodos para generar tablas PDF
  private generarTablaPDFProductos(doc: jsPDF, yPosition: number): number {
    if (this.productosMasVendidos.length === 0) return yPosition;

    const tableData = this.productosMasVendidos.map(p => [
      p.producto__id,
      p.producto__nombre,
      this.formatearMoneda(p.producto__precio),
      this.formatearNumero(p.cantidad_vendida),
      this.formatearNumero(p.veces_comprado),
      this.formatearMoneda(p.ingreso_total)
    ]);

    autoTable(doc, {
      head: [['ID', 'Producto', 'Precio', 'Cant. Vendida', 'Veces Comprado', 'Ingreso Total']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 8 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private generarTablaPDFVentas(doc: jsPDF, yPosition: number): number {
    if (this.ventasPorPeriodo.length === 0) return yPosition;

    const tableData = this.ventasPorPeriodo.map(v => [
      v.periodo,
      this.formatearNumero(v.total_pedidos),
      this.formatearMoneda(v.total_ingresos),
      this.formatearNumero(v.total_productos_vendidos),
      this.formatearMoneda(v.ingreso_promedio_pedido)
    ]);

    autoTable(doc, {
      head: [['Período', 'Pedidos', 'Ingresos', 'Productos', 'Promedio']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 8 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private generarTablaPDFClientes(doc: jsPDF, yPosition: number): number {
    if (this.clientesTop.length === 0) return yPosition;

    const tableData = this.clientesTop.map(c => [
      c.usuario__id,
      c.usuario__nombre_completo,
      c.usuario__email,
      this.formatearNumero(c.total_pedidos),
      this.formatearMoneda(c.total_gastado),
      this.formatearMoneda(c.gasto_promedio)
    ]);

    autoTable(doc, {
      head: [['ID', 'Nombre', 'Email', 'Pedidos', 'Total Gastado', 'Promedio']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 8 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private generarPDFResumen(doc: jsPDF, yPosition: number): number {
    if (!this.resumenGeneral) return yPosition;

    const data = [
      ['Total Pedidos', this.formatearNumero(this.resumenGeneral.total_pedidos)],
      ['Ingresos Totales', this.formatearMoneda(this.resumenGeneral.total_ingresos)],
      ['Promedio por Pedido', this.formatearMoneda(this.resumenGeneral.ingreso_promedio)],
      ['Clientes Únicos', this.formatearNumero(this.resumenGeneral.clientes_unicos)],
      ['Productos Únicos', this.formatearNumero(this.resumenGeneral.productos_unicos_vendidos)]
    ];

    autoTable(doc, {
      head: [['Métrica', 'Valor']],
      body: data,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private generarPDFEfectividadOfertas(doc: jsPDF, yPosition: number): number {
    if (!this.efectividadOfertas) return yPosition;

    // Productos con ofertas
    if (this.efectividadOfertas.productos_con_ofertas && this.efectividadOfertas.productos_con_ofertas.length > 0) {
      doc.setFontSize(14);
      doc.text('Productos con Ofertas', 14, yPosition);
      yPosition += 10;

      const dataConOfertas = this.efectividadOfertas.productos_con_ofertas.map(p => [
        p.producto__nombre,
        p.nombre_oferta || 'Sin nombre',
        this.formatearNumero(p.cantidad_vendida),
        this.formatearMoneda(p.ingreso_con_descuento || 0)
      ]);

      autoTable(doc, {
        head: [['Producto', 'Oferta', 'Cantidad', 'Ingreso']],
        body: dataConOfertas,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Productos sin ofertas
    if (this.efectividadOfertas.productos_sin_ofertas && this.efectividadOfertas.productos_sin_ofertas.length > 0) {
      doc.setFontSize(14);
      doc.text('Productos sin Ofertas', 14, yPosition);
      yPosition += 10;

      const dataSinOfertas = this.efectividadOfertas.productos_sin_ofertas.map(p => [
        p.producto__nombre,
        this.formatearNumero(p.cantidad_vendida),
        this.formatearMoneda(p.ingreso_total || 0)
      ]);

      autoTable(doc, {
        head: [['Producto', 'Cantidad', 'Ingreso']],
        body: dataSinOfertas,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    return yPosition;
  }

  private generarPDFDashboard(doc: jsPDF, yPosition: number): number {
    if (!this.dashboardData) return yPosition;

    const metricas = [
      ['Pedidos Hoy', this.formatearNumero(this.dashboardData.metricas.hoy.total_pedidos)],
      ['Ingresos Hoy', this.formatearMoneda(this.dashboardData.metricas.hoy.total_ingresos)],
      ['Pedidos Última Semana', this.formatearNumero(this.dashboardData.metricas.ultima_semana.total_pedidos)],
      ['Ingresos Última Semana', this.formatearMoneda(this.dashboardData.metricas.ultima_semana.total_ingresos)],
      ['Pedidos Último Mes', this.formatearNumero(this.dashboardData.metricas.ultimo_mes.total_pedidos)],
      ['Ingresos Último Mes', this.formatearMoneda(this.dashboardData.metricas.ultimo_mes.total_ingresos)]
    ];

    autoTable(doc, {
      head: [['Métrica', 'Valor']],
      body: metricas,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  // Métodos para generar hojas Excel
  private agregarHojaProductos(workbook: XLSX.WorkBook): void {
    if (this.productosMasVendidos.length === 0) return;

    const wsData = [
      ['ID', 'Producto', 'Precio', 'Stock', 'Cantidad Vendida', 'Veces Comprado', 'Ingreso Total', 'Precio Promedio'],
      ...this.productosMasVendidos.map(p => [
        p.producto__id,
        p.producto__nombre,
        p.producto__precio,
        p.producto__stock,
        p.cantidad_vendida,
        p.veces_comprado,
        p.ingreso_total,
        p.precio_promedio_venta
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Productos Vendidos');
  }

  private agregarHojaVentas(workbook: XLSX.WorkBook): void {
    if (this.ventasPorPeriodo.length === 0) return;

    const wsData = [
      ['Período', 'Total Pedidos', 'Total Ingresos', 'Total Productos', 'Ingreso Promedio', 'Descuento Promedio'],
      ...this.ventasPorPeriodo.map(v => [
        v.periodo,
        v.total_pedidos,
        v.total_ingresos,
        v.total_productos_vendidos,
        v.ingreso_promedio_pedido,
        v.descuento_promedio
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Ventas por Período');
  }

  private agregarHojaClientes(workbook: XLSX.WorkBook): void {
    if (this.clientesTop.length === 0) return;

    const wsData = [
      ['ID', 'Nombre', 'Email', 'Total Pedidos', 'Total Gastado', 'Gasto Promedio', 'Productos Comprados'],
      ...this.clientesTop.map(c => [
        c.usuario__id,
        c.usuario__nombre_completo,
        c.usuario__email,
        c.total_pedidos,
        c.total_gastado,
        c.gasto_promedio,
        c.total_productos_comprados
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Top Clientes');
  }

  private agregarHojaResumen(workbook: XLSX.WorkBook): void {
    if (!this.resumenGeneral) return;

    const wsData = [
      ['Métrica', 'Valor'],
      ['Total Pedidos', this.resumenGeneral.total_pedidos],
      ['Ingresos Totales', this.resumenGeneral.total_ingresos],
      ['Promedio por Pedido', this.resumenGeneral.ingreso_promedio],
      ['Descuento Promedio', this.resumenGeneral.descuento_promedio],
      ['Total Productos Vendidos', this.resumenGeneral.total_productos_vendidos],
      ['Productos Únicos', this.resumenGeneral.productos_unicos_vendidos],
      ['Clientes Únicos', this.resumenGeneral.clientes_unicos]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Resumen General');
  }

  private agregarHojaEfectividadOfertas(workbook: XLSX.WorkBook): void {
    if (!this.efectividadOfertas) return;

    // Hoja de productos con ofertas
    if (this.efectividadOfertas.productos_con_ofertas && this.efectividadOfertas.productos_con_ofertas.length > 0) {
      const wsDataConOfertas = [
        ['ID', 'Producto', 'Oferta', 'Cantidad Vendida', 'Ingreso con Descuento', 'Ahorro Clientes', 'Ventas'],
        ...this.efectividadOfertas.productos_con_ofertas.map(p => [
          p.producto__id,
          p.producto__nombre,
          p.nombre_oferta || 'Sin nombre',
          p.cantidad_vendida,
          p.ingreso_con_descuento || 0,
          p.ahorro_total_clientes || 0,
          p.ventas_count
        ])
      ];

      const wsConOfertas = XLSX.utils.aoa_to_sheet(wsDataConOfertas);
      XLSX.utils.book_append_sheet(workbook, wsConOfertas, 'Productos con Ofertas');
    }

    // Hoja de productos sin ofertas
    if (this.efectividadOfertas.productos_sin_ofertas && this.efectividadOfertas.productos_sin_ofertas.length > 0) {
      const wsDataSinOfertas = [
        ['ID', 'Producto', 'Cantidad Vendida', 'Ingreso Total', 'Ventas'],
        ...this.efectividadOfertas.productos_sin_ofertas.map(p => [
          p.producto__id,
          p.producto__nombre,
          p.cantidad_vendida,
          p.ingreso_total || 0,
          p.ventas_count
        ])
      ];

      const wsSinOfertas = XLSX.utils.aoa_to_sheet(wsDataSinOfertas);
      XLSX.utils.book_append_sheet(workbook, wsSinOfertas, 'Productos sin Ofertas');
    }
  }

  private agregarHojaDashboard(workbook: XLSX.WorkBook): void {
    if (!this.dashboardData) return;

    const wsData = [
      ['Métrica', 'Valor'],
      ['Pedidos Hoy', this.dashboardData.metricas.hoy.total_pedidos],
      ['Ingresos Hoy', this.dashboardData.metricas.hoy.total_ingresos],
      ['Pedidos Última Semana', this.dashboardData.metricas.ultima_semana.total_pedidos],
      ['Ingresos Última Semana', this.dashboardData.metricas.ultima_semana.total_ingresos],
      ['Pedidos Último Mes', this.dashboardData.metricas.ultimo_mes.total_pedidos],
      ['Ingresos Último Mes', this.dashboardData.metricas.ultimo_mes.total_ingresos]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Dashboard');

    // Agregar hoja de top productos del mes si existe
    if (this.dashboardData.top_productos_mes && this.dashboardData.top_productos_mes.length > 0) {
      const wsProductosData = [
        ['ID', 'Producto', 'Cantidad Vendida', 'Ingreso Total'],
        ...this.dashboardData.top_productos_mes.map(p => [
          p.producto__id,
          p.producto__nombre,
          p.cantidad_vendida,
          p.ingreso_total
        ])
      ];

      const wsProductos = XLSX.utils.aoa_to_sheet(wsProductosData);
      XLSX.utils.book_append_sheet(workbook, wsProductos, 'Top Productos Mes');
    }

    // Agregar hoja de top clientes del mes si existe
    if (this.dashboardData.top_clientes_mes && this.dashboardData.top_clientes_mes.length > 0) {
      const wsClientesData = [
        ['ID', 'Cliente', 'Total Pedidos', 'Total Gastado'],
        ...this.dashboardData.top_clientes_mes.map(c => [
          c.usuario__id,
          c.usuario__nombre_completo,
          c.total_pedidos,
          c.total_gastado
        ])
      ];

      const wsClientes = XLSX.utils.aoa_to_sheet(wsClientesData);
      XLSX.utils.book_append_sheet(workbook, wsClientes, 'Top Clientes Mes');
    }
  }
}
