import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OfertasService, Oferta, OfertaDetallada, Producto } from '../../core/services/ofertas.service';
import { ProductosService } from '../../core/services/productos.service';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.css'
})
export class OfertasComponent implements OnInit {
  
  // ==================== PROPIEDADES PRINCIPALES ====================
  ofertas: Oferta[] = [];
  productos: Producto[] = [];
  cargando: boolean = false;
  
  // ==================== VARIABLES DE MODAL CREAR/EDITAR OFERTA ====================
  isModalOfertaOpen: boolean = false;
  isEditMode: boolean = false;
  ofertaSeleccionada: Oferta | null = null;
  
  // Campos del formulario de oferta
  nombre: string = '';
  descripcion: string = '';
  descuento: number = 0;
  fecha_inicio: string = '';
  fecha_fin: string = '';
  is_active: boolean = true;
  
  // ==================== VARIABLES DE MODAL ASIGNAR PRODUCTOS ====================
  isModalAsignarProductosOpen: boolean = false;
  ofertaParaAsignar: Oferta | null = null;
  productosDisponibles: Producto[] = [];
  productosSeleccionados: number[] = [];
  searchProducto: string = '';
  
  // ==================== PAGINACIÓN ====================
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // ==================== FILTROS ====================
  searchOferta: string = '';
  filtroEstado: string = '';
  
  // ==================== REFERENCIAS PARA TEMPLATE ====================
  Math = Math;
  
  constructor(
    private ofertasService: OfertasService,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.cargarOfertas();
    this.cargarProductos();
  }

  // ==================== MÉTODOS DE CARGA DE DATOS ====================

  /**
   * Carga todas las ofertas
   */
  cargarOfertas(): void {
    this.cargando = true;
    this.ofertasService.getOfertas().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.cargando = false;
        console.log('Ofertas cargadas:', this.ofertas);
      },
      error: (error) => {
        console.error('Error al cargar ofertas:', error);
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar las ofertas', 'error');
      }
    });
  }

  /**
   * Carga todos los productos
   */
  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        console.log('Productos cargados:', this.productos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  // ==================== MÉTODOS CRUD DE OFERTAS ====================

  /**
   * Abre el modal para crear una nueva oferta
   */
  abrirModalCrearOferta(): void {
    this.isEditMode = false;
    this.ofertaSeleccionada = null;
    this.limpiarFormularioOferta();
    this.isModalOfertaOpen = true;
  }

  /**
   * Abre el modal para editar una oferta existente
   */
  abrirModalEditarOferta(oferta: Oferta): void {
    this.isEditMode = true;
    this.ofertaSeleccionada = oferta;
    this.cargarDatosOfertaEnFormulario(oferta);
    this.isModalOfertaOpen = true;
  }

  /**
   * Cierra el modal de crear/editar oferta
   */
  cerrarModalOferta(): void {
    this.isModalOfertaOpen = false;
    this.limpiarFormularioOferta();
  }

  /**
   * Limpia los campos del formulario
   */
  limpiarFormularioOferta(): void {
    this.nombre = '';
    this.descripcion = '';
    this.descuento = 0;
    this.fecha_inicio = '';
    this.fecha_fin = '';
    this.is_active = true;
  }

  /**
   * Carga los datos de una oferta en el formulario
   */
  cargarDatosOfertaEnFormulario(oferta: Oferta): void {
    this.nombre = oferta.nombre;
    this.descripcion = oferta.descripcion;
    this.descuento = parseFloat(oferta.descuento);
    this.fecha_inicio = oferta.fecha_inicio.split('T')[0]; // Solo la fecha
    this.fecha_fin = oferta.fecha_fin.split('T')[0];
    this.is_active = oferta.is_active;
  }

  /**
   * Guarda la oferta (crear o actualizar)
   */
  guardarOferta(): void {
    if (!this.validarFormularioOferta()) {
      return;
    }

    const ofertaData = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      descuento: this.descuento.toString(),
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin,
      is_active: this.is_active
    };

    const operacion = this.isEditMode
      ? this.ofertasService.actualizarOferta(this.ofertaSeleccionada!.id, ofertaData)
      : this.ofertasService.crearOferta(ofertaData);

    // Mostrar loading
    Swal.fire({
      title: this.isEditMode ? 'Actualizando oferta...' : 'Creando oferta...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    operacion.subscribe({
      next: (response) => {
        Swal.close();
        
        const mensaje = this.isEditMode 
          ? 'Oferta actualizada exitosamente'
          : 'Oferta creada exitosamente';
          
        Swal.fire('Éxito', mensaje, 'success');
        this.cargarOfertas();
        this.cerrarModalOferta();
      },
      error: (error) => {
        Swal.close();
        console.error('Error al guardar oferta:', error);
        
        let mensaje = 'Error al guardar la oferta';
        if (error.error?.nombre) {
          mensaje = error.error.nombre[0];
        } else if (error.error?.message) {
          mensaje = error.error.message;
        }
        
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /**
   * Valida el formulario de oferta
   */
  validarFormularioOferta(): boolean {
    if (!this.nombre.trim()) {
      Swal.fire('Error', 'El nombre es requerido', 'error');
      return false;
    }

    if (!this.descripcion.trim()) {
      Swal.fire('Error', 'La descripción es requerida', 'error');
      return false;
    }

    if (this.descuento <= 0 || this.descuento > 100) {
      Swal.fire('Error', 'El descuento debe ser entre 1% y 100%', 'error');
      return false;
    }

    if (!this.fecha_inicio || !this.fecha_fin) {
      Swal.fire('Error', 'Las fechas de inicio y fin son requeridas', 'error');
      return false;
    }

    if (new Date(this.fecha_inicio) >= new Date(this.fecha_fin)) {
      Swal.fire('Error', 'La fecha de fin debe ser posterior a la fecha de inicio', 'error');
      return false;
    }

    return true;
  }

  /**
   * Elimina una oferta
   */
  eliminarOferta(oferta: Oferta): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la oferta "${oferta.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Eliminando oferta...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.ofertasService.desactivarOferta(oferta.id).subscribe({
          next: (response) => {
            Swal.close();
            Swal.fire('Eliminada', response.mensaje, 'success');
            this.cargarOfertas();
          },
          error: (error) => {
            Swal.close();
            console.error('Error al eliminar oferta:', error);
            Swal.fire('Error', 'No se pudo eliminar la oferta', 'error');
          }
        });
      }
    });
  }

  // ==================== MÉTODOS DE ASIGNAR PRODUCTOS ====================

  /**
   * Abre el modal para asignar productos a una oferta
   */
  abrirModalAsignarProductos(oferta: Oferta): void {
    this.ofertaParaAsignar = oferta;
    this.productosSeleccionados = [];
    this.searchProducto = '';
    this.cargarProductosDisponibles();
    this.isModalAsignarProductosOpen = true;
  }

  /**
   * Cierra el modal de asignar productos
   */
  cerrarModalAsignarProductos(): void {
    this.isModalAsignarProductosOpen = false;
    this.ofertaParaAsignar = null;
    this.productosSeleccionados = [];
    this.productosDisponibles = [];
  }

  /**
   * Carga los productos disponibles (sin oferta o con otra oferta)
   */
  cargarProductosDisponibles(): void {
    this.productosDisponibles = this.productos.filter(producto => 
      producto.is_active && 
      (!producto.oferta || producto.oferta.id !== this.ofertaParaAsignar!.id)
    );
  }

  /**
   * Filtra productos por búsqueda
   */
  get productosFilter(): Producto[] {
    if (!this.searchProducto.trim()) {
      return this.productosDisponibles;
    }
    
    return this.productosDisponibles.filter(producto =>
      producto.nombre.toLowerCase().includes(this.searchProducto.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(this.searchProducto.toLowerCase())
    );
  }

  /**
   * Togglea la selección de un producto
   */
  toggleProductoSeleccion(productoId: number): void {
    const index = this.productosSeleccionados.indexOf(productoId);
    if (index > -1) {
      this.productosSeleccionados.splice(index, 1);
    } else {
      this.productosSeleccionados.push(productoId);
    }
  }

  /**
   * Verifica si un producto está seleccionado
   */
  isProductoSeleccionado(productoId: number): boolean {
    return this.productosSeleccionados.includes(productoId);
  }

  /**
   * Selecciona todos los productos filtrados
   */
  seleccionarTodos(): void {
    this.productosSeleccionados = this.productosFilter.map(p => p.id);
  }

  /**
   * Deselecciona todos los productos
   */
  deseleccionarTodos(): void {
    this.productosSeleccionados = [];
  }

  /**
   * Asigna los productos seleccionados a la oferta
   */
  asignarProductosAOferta(): void {
    if (this.productosSeleccionados.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un producto', 'error');
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Asignando productos...',
      text: `Asignando ${this.productosSeleccionados.length} productos a la oferta`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.ofertasService.agregarProductosAOferta(
      this.ofertaParaAsignar!.id,
      this.productosSeleccionados
    ).subscribe({
      next: (response) => {
        Swal.close();
        Swal.fire('Éxito', response.mensaje, 'success');
        this.cargarOfertas();
        this.cargarProductos();
        this.cerrarModalAsignarProductos();
      },
      error: (error) => {
        Swal.close();
        console.error('Error al asignar productos:', error);
        
        let mensaje = 'Error al asignar productos a la oferta';
        if (error.error?.error) {
          mensaje = error.error.error;
        }
        
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  // ==================== MÉTODOS DE UTILIDAD ====================

  /**
   * Obtiene el estado de una oferta
   */
  getEstadoOferta(oferta: Oferta): string {
    return this.ofertasService.getEstadoOferta(oferta);
  }

  /**
   * Obtiene la clase CSS para el estado de la oferta
   */
  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'vigente':
        return 'bg-green-100 text-green-800';
      case 'proxima':
        return 'bg-blue-100 text-blue-800';
      case 'expirada':
        return 'bg-red-100 text-red-800';
      case 'inactiva':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Formatea el descuento
   */
  formatearDescuento(descuento: string): string {
    return this.ofertasService.formatearDescuento(descuento);
  }

  /**
   * Formatea una fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  /**
   * Calcula los días restantes para que expire una oferta
   */
  diasRestantes(fechaFin: string): number {
    return this.ofertasService.diasRestantesOferta(fechaFin);
  }

  /**
   * Obtiene el texto del estado de la oferta
   */
  getTextoEstado(estado: string): string {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'proxima':
        return 'Próxima';
      case 'expirada':
        return 'Expirada';
      case 'inactiva':
        return 'Inactiva';
      default:
        return 'Desconocido';
    }
  }

  // ==================== PAGINACIÓN ====================

  /**
   * Obtiene las ofertas filtradas según los criterios de búsqueda
   */
  get ofertasFiltradas(): Oferta[] {
    let filtradas = [...this.ofertas];

    // Filtro por texto de búsqueda
    if (this.searchOferta.trim()) {
      const busqueda = this.searchOferta.toLowerCase();
      filtradas = filtradas.filter(oferta =>
        oferta.nombre.toLowerCase().includes(busqueda) ||
        oferta.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      filtradas = filtradas.filter(oferta => 
        this.getEstadoOferta(oferta) === this.filtroEstado
      );
    }

    return filtradas;
  }

  get ofertasPaginadas(): Oferta[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.ofertasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.ofertasFiltradas.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * Genera los números de página para mostrar en la paginación
   */
  getNumerosPaginas(): string[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: string[] = [];

    if (total <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= total; i++) {
        paginas.push(i.toString());
      }
    } else {
      // Siempre mostrar primera página
      paginas.push('1');

      if (actual <= 4) {
        // Si estamos cerca del inicio
        for (let i = 2; i <= 5; i++) {
          paginas.push(i.toString());
        }
        paginas.push('...');
        paginas.push(total.toString());
      } else if (actual >= total - 3) {
        // Si estamos cerca del final
        paginas.push('...');
        for (let i = total - 4; i <= total; i++) {
          paginas.push(i.toString());
        }
      } else {
        // Si estamos en el medio
        paginas.push('...');
        for (let i = actual - 1; i <= actual + 1; i++) {
          paginas.push(i.toString());
        }
        paginas.push('...');
        paginas.push(total.toString());
      }
    }

    return paginas;
  }

  /**
   * Maneja el cambio en el número de elementos por página
   */
  onCambiarItemsPorPagina(): void {
    this.paginaActual = 1; // Resetear a la primera página
  }

  /**
   * Ir a una página específica
   */
  irAPagina(event: any): void {
    const input = event.target.closest('.flex').querySelector('input');
    const pagina = parseInt(input.value);
    
    if (pagina && pagina >= 1 && pagina <= this.totalPaginas) {
      this.cambiarPagina(pagina);
    } else {
      // Resetear el input si el valor no es válido
      input.value = this.paginaActual.toString();
    }
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.searchOferta = '';
    this.filtroEstado = '';
    this.paginaActual = 1;
  }

  /**
   * Se ejecuta cuando cambia cualquier filtro
   */
  onFiltroChange(): void {
    this.paginaActual = 1; // Resetear a la primera página cuando cambian los filtros
  }
}
