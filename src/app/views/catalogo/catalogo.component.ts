import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../core/services/productos.service';
import { AutoresService } from '../../core/services/autores.service';
import { GenerosService } from '../../core/services/generos.service';
import { CategoriasService } from '../../core/services/categorias.service';
import { EditorialesService } from '../../core/services/editoriales.service';
import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { OfertasService } from '../../core/services/ofertas.service';
import Swal from 'sweetalert2';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  imagen: string;
  is_active: boolean;
  categoria: { nombre: string } | null;
  autor: { nombre: string } | null; // Ahora es un objeto con nombre o null
  editorial: { nombre: string } | null; // Ahora es un objeto con nombre o null
  genero: { nombre: string } | null; // Ahora es un objeto con nombre o null
  cantidad: number; // cantidad en el carrito
  // Propiedades para ofertas
  oferta?: any;
  tiene_oferta_vigente?: boolean;
  precio_con_descuento?: string;
  descuento_aplicado?: string;
  tieneOferta?: boolean;
  ofertaId?: number;
  ofertaNombre?: string;
  ofertaDescuento?: number;
}


@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export default class CatalogoComponent implements OnInit {
  productos: Producto[] = [];  // Lista de productos obtenidos
  productosFiltrados: Producto[] = []; // Lista de productos filtrados
  ofertas: any[] = []; // Lista de ofertas vigentes
  isAdmin: boolean = false; // Asegúrate de controlar si el usuario es administrador
  generos: Array<any> = [];
  autores: Array<any> = [];
  editoriales: Array<any> = [];
  subcategorias: Array<any> = [];
  categoriasMap: { [key: number]: string } = {};
  generosMap: { [key: number]: string } = {};
  autoresMap: { [key: number]: string } = {};
  editorialesMap: { [key: number]: string } = {};
  paginaActual: number = 1;
  cantidadPorPagina: number = 10;

  constructor(private productosService: ProductosService, private autoresService: AutoresService,
    private generosService: GenerosService,
    private editorialesService: EditorialesService,
    private categoriasService: CategoriasService,
    private carritoService: CarritoService,
    private detalleCarritoService: DetalleCarritoService,
    private ofertasService: OfertasService) { }

  ngOnInit() {
    this.getProductos();
    this.getAutores();
    this.getGeneros();
    this.getEditoriales();
    this.getSubcategorias();
    this.obtenerCarritoActivo();
    this.cargarOfertas();
    
    // Escuchar cambios en el sessionStorage para detectar cuando se inicia sesión
    this.escucharCambiosSesion();
  }

  // Método para escuchar cambios en la sesión
  escucharCambiosSesion() {
    // Verificar cada cierto tiempo si hay cambios en la sesión
    setInterval(() => {
      const token = sessionStorage.getItem('token');
      const carritoActivo = localStorage.getItem('carritoActivo');
      
      // Si hay token pero no hay carrito activo, intentar obtenerlo
      if (token && !carritoActivo) {
        console.log('Token detectado sin carrito activo, obteniendo carrito...');
        this.obtenerCarritoActivo();
      }
    }, 2000); // Verificar cada 2 segundos
  }

  getProductos(): void {
    this.productosService.getProductos().subscribe(
      (productos) => {
        this.productos = productos.filter(producto => producto.is_active).map(producto => ({
          ...producto,
          cantidad: 1 // Asegurar que cada producto tenga cantidad inicial
        })); // Filtrar solo productos activos
        console.log('Productos después del filtrado:', this.productos); // Verifica los productos que llegan al frontend
        this.aplicarOfertasAProductos(); // Aplicar ofertas después de cargar productos
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  getSubcategorias() {
    this.categoriasService.getCategorias().subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.subcategorias = resp;
        this.categoriasMap = {};
        this.subcategorias.forEach((categoria: any) => {
          this.categoriasMap[categoria.id] = categoria.nombre;
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getEditoriales() {
    this.editorialesService.getEditoriales().subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.editoriales = resp;
        this.editorialesMap = {};
        this.editoriales.forEach((editorial: any) => {
          this.editorialesMap[editorial.id] = editorial.nombre;
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getAutores() {
    this.autoresService.getAutores().subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.autores = resp;
        this.autoresMap = {};
        this.autores.forEach((autor: any) => {
          this.autoresMap[autor.id] = autor.nombre;
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getGeneros() {
    this.generosService.getGeneros().subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.generos = resp;
        this.generosMap = {};
        this.generos.forEach((genero: any) => {
          this.generosMap[genero.id] = genero.nombre;
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  aumentarCantidad(producto: Producto) {
    producto.cantidad++;
  }

  disminuirCantidad(producto: Producto) {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  filtrarProductos(): void {
    // Filtramos los productos dependiendo del rol
    if (this.isAdmin) {
      // Si es administrador, mostramos todos los productos (activos e inactivos)
      this.productosFiltrados = this.productos;
    } else {
      // Si no es administrador, mostramos solo los productos activos
      // this.productosFiltrados = this.productos.filter(producto => producto.is_active);
      this.productos = this.productos.filter(producto => producto.is_active).map(producto => ({
        ...producto,
        cantidad: 1
      }));
    }
  }

  cargarOfertas() {
    this.ofertasService.getOfertasVigentes().subscribe({
      next: (response: any) => {
        this.ofertas = response.ofertas || [];
        this.aplicarOfertasAProductos();
      },
      error: (error: any) => {
        console.error('Error al cargar ofertas:', error);
      }
    });
  }

  aplicarOfertasAProductos() {
    this.productos.forEach(producto => {
      // Primero verificar si el producto tiene ofertas desde las ofertas vigentes cargadas
      const ofertaAplicable = this.ofertas.find(oferta => 
        oferta.productos && oferta.productos.some((p: any) => p.id === producto.id)
      );
      
      if (ofertaAplicable) {
        producto.tieneOferta = true;
        producto.ofertaId = ofertaAplicable.id;
        producto.ofertaNombre = ofertaAplicable.nombre;
        producto.ofertaDescuento = ofertaAplicable.descuento;
      } else {
        // También verificar si el producto ya viene con información de oferta del backend
        if (producto.oferta && producto.oferta.is_active) {
          producto.tieneOferta = true;
          producto.ofertaId = producto.oferta.id;
          producto.ofertaNombre = producto.oferta.nombre;
          producto.ofertaDescuento = producto.oferta.descuento;
        } else {
          producto.tieneOferta = false;
          producto.ofertaId = undefined;
          producto.ofertaNombre = undefined;
          producto.ofertaDescuento = undefined;
        }
      }
    });
  }

  // Calcular precio con oferta aplicada
  calcularPrecioConOferta(producto: Producto): number {
    const precio = parseFloat(producto.precio);
    if (producto.tieneOferta && producto.ofertaDescuento) {
      const descuento = parseFloat(producto.ofertaDescuento.toString());
      return Math.max(0, precio - descuento);
    }
    return precio;
  }

  // Formatear descuento como moneda
  formatearDescuento(descuento: string | number | undefined): string {
    if (!descuento) return '';
    const valor = typeof descuento === 'string' ? parseFloat(descuento) : descuento;
    return `Bs ${valor.toFixed(2)}`;
  }

  agregarProducto(producto: Producto): void {
    // Verificar stock antes que nada
    if (producto.stock === 0) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Sin stock",
        text: "Este producto no tiene stock disponible",
        showConfirmButton: true,
      });
      return;
    }

    // Verificar si hay un token de sesión válido
    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "No has iniciado sesión",
        text: "Por favor, inicia sesión para agregar productos al carrito",
        showConfirmButton: true,
      });
      return;
    }

    // Verificar que el producto tenga un ID válido
    if (!producto.id || isNaN(producto.id)) {
      console.error('ID de producto inválido:', producto.id);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error",
        text: "El producto seleccionado no tiene un ID válido",
        showConfirmButton: true,
      });
      return;
    }

    const detalle = {
      producto_id: producto.id,
      cantidad: producto.cantidad || 1
    };

    console.log('Intentando agregar producto:', detalle);
    console.log('Token presente:', !!token);
    console.log('Producto completo:', producto);

    this.detalleCarritoService.agregarProducto(detalle).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        // Notificar al carrito que hay cambios
        this.carritoService.notificarCambioCarrito();
        
        // Actualizar el carrito activo después de agregar el producto
        this.obtenerCarritoActivo();
        
        // Preparar mensaje de éxito con información de stock
        let titulo = "¡Producto agregado al carrito!";
        let texto = `${producto.nombre} se agregó correctamente`;
        
        // Agregar información especial si queda poco stock
        if (producto.stock <= 4) {
          titulo = "¡Producto agregado! ⚠️";
          texto = `${producto.nombre} se agregó correctamente.\n¡Quedan solo ${producto.stock} disponibles!`;
        }
        
        Swal.fire({
          position: "center",
          icon: "success",
          title: titulo,
          text: texto,
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: (error) => {
        console.error('Error completo al agregar producto:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        
        let mensajeError = 'Error al agregar el producto al carrito';
        
        if (error.status === 401) {
          mensajeError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
          // Limpiar datos de sesión inválidos
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('carritoActivo');
        } else if (error.status === 400) {
          // Mostrar el mensaje específico del backend si está disponible
          if (error.error && error.error.detail) {
            mensajeError = error.error.detail;
          } else if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            mensajeError = error.error;
          } else {
            mensajeError = 'Datos inválidos. El producto puede no estar disponible o el carrito no está activo';
          }
        } else if (error.error && error.error.message) {
          mensajeError = error.error.message;
        }

        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error",
          text: mensajeError,
          showConfirmButton: true,
        });
      }
    });
  }


  obtenerCarritoActivo(): void {
    this.carritoService.getCarritos().subscribe({
      next: (carritos: any[]) => {
        const carritosActivos = carritos.filter(c => c.estado === 'ACTIVO');
        if (carritosActivos.length > 0) {
          // Tomamos el más reciente (mayor ID)
          const carritoMasReciente = carritosActivos.reduce((a, b) => a.id > b.id ? a : b);
          localStorage.setItem('carritoActivo', JSON.stringify({ id: carritoMasReciente.id }));
          console.log('Carrito activo:', carritoMasReciente.id);
        } else {
          console.warn('No hay carritos activos.');
        }
      },
      error: (error) => {
        console.error('Error al obtener carritos:', error);
      }
    });
  }

  // Método mejorado que verifica y obtiene carrito activo
  verificarYCrearCarritoActivo(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Primero verificar si ya hay un carrito en localStorage
      const carritoActivo = localStorage.getItem('carritoActivo');
      if (carritoActivo) {
        console.log('Carrito encontrado en localStorage:', carritoActivo);
        resolve(JSON.parse(carritoActivo));
        return;
      }

      // Si no hay carrito en localStorage, obtener directamente el carrito activo de la API
      this.carritoService.obtenerCarritoActivo().subscribe({
        next: (carrito: any) => {
          if (carrito && carrito.id) {
            const carritoData = { id: carrito.id };
            localStorage.setItem('carritoActivo', JSON.stringify(carritoData));
            console.log('Carrito activo obtenido:', carrito.id);
            resolve(carritoData);
          } else {
            console.warn('No se encontró carrito activo');
            // Si no hay carrito activo, el backend debería crear uno automáticamente
            // al agregar el primer producto
            resolve({ id: null });
          }
        },
        error: (error: any) => {
          console.error('Error al obtener carrito activo:', error);
          // Aún así intentamos agregar el producto, puede que el backend cree el carrito automáticamente
          resolve({ id: null });
        }
      });
    });
  }

  get productosPaginados() {
  const start = (this.paginaActual - 1) * this.cantidadPorPagina;
  const end = start + this.cantidadPorPagina;
  return this.productos.slice(start, end);
}

get paginasTotales() {
  return Array(Math.ceil(this.productos.length / this.cantidadPorPagina))
    .fill(0)
    .map((_, i) => i + 1);
}

cambiarPagina(pagina: number) {
  this.paginaActual = pagina;
}

actualizarCantidadPorPagina() {
  this.paginaActual = 1; // reinicia a la primera página
}
}