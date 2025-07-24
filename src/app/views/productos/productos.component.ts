import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../core/services/productos.service';
import { AutoresService } from '../../core/services/autores.service';
import { GenerosService } from '../../core/services/generos.service';
import { CategoriasService } from '../../core/services/categorias.service'; // Este servicio en realidad maneja subcategorías
import { EditorialesService } from '../../core/services/editoriales.service';
import { ImgDropService } from '../../core/services/img-drop.service';
import { OfertasService, Oferta } from '../../core/services/ofertas.service';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxDropzoneModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export default class ProductosComponent {
  productos: any[] = [];
  generos: Array<any> = [];
  autores: Array<any> = [];
  editoriales: Array<any> = [];
  subcategorias: Array<any> = [];

  nombre: any;
  descripcion: any;
  imagen: any;
  precio: any;
  is_active: boolean = true;
  stock: number = 0;
  selectedAutor: any = null;
  selectedGenero: any = null;
  selectedEditorial: any = null;
  selectedSubcategoria: any = "";

  nombreUpdate: any;
  descripcionUpdate: any;
  imagenUpdate: any;
  precioUpdate: any;
  generoUpdate: any;
  autorUpdate: any;
  editorialUpdate: any;
  subcategoriaUpdate: any;
  productoIdSelected: any;
  is_activeUpdate: boolean = true;
  stockUpdate: number = 0;

  categoriasMap: { [key: number]: string } = {};
  generosMap: { [key: number]: string } = {};
  autoresMap: { [key: number]: string } = {};
  editorialesMap: { [key: number]: string } = {};
  previewImageUrl: string | ArrayBuffer | null = null;
  isModalRegisterProductoOpen: boolean = false;
  isModalUpdateProductoOpen: boolean = false;
  
  // Variables para ofertas
  ofertas: Oferta[] = [];
  isModalOfertasOpen: boolean = false;
  productoSeleccionadoParaOferta: any = null;
  ofertaSeleccionada: number | null = null;
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(
    private productoService: ProductosService,
    private autoresService: AutoresService,
    private generosService: GenerosService,
    private editorialesService: EditorialesService,
    private categoriasService: CategoriasService, // Este en realidad es para subcategorías
    private imgdropService: ImgDropService,
    private ofertasService: OfertasService
  ) {
    this.getProductos();
    this.getAutores();
    this.getGeneros();
    this.getEditoriales();
    this.getSubcategorias();
    this.getOfertas();
  }

  files: File[] = [];

  onSelect(event: any) {
    this.files = []; // solo permite una imagen
    this.files.push(...event.addedFiles);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageUrl = reader.result;
    };

    if (this.files[0]) {
      reader.readAsDataURL(this.files[0]);
    }
  }

  onRemove(file: File): void {
    this.files.splice(this.files.indexOf(file), 1);
    this.previewImageUrl = null;
  }

  upload(): Observable<string> {
    const file_data = this.files[0];
    const data = new FormData();

    data.append('file', file_data);
    data.append('upload_preset', 'nova-library');
    data.append('cloud_name', 'day1tsmdn');

    return this.imgdropService.uploadImg(data).pipe(
      map((response: any) => response.secure_url)
    );
  }

  onCategoriaChange() {
    if (this.selectedSubcategoria == 1) {
      this.selectedGenero = null;
      this.selectedEditorial = null;
      this.selectedAutor = null;
    }
  }

  getProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log("Productos recibidos:", this.productos);
      },
      error: (error) => {
        console.error('Error al obtener productos', error);
      }
    });
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

 createProducto() {
  if (this.files.length === 0) {
    Swal.fire("Por favor selecciona una imagen");
    return;
  }

  this.upload().subscribe({
    next: (imgUrl: string) => {
      let producto: any = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        imagen: imgUrl,
        precio: this.precio.toString(),
        stock: Number(this.stock),
        is_active: true,
        categoria_id: Number(this.selectedSubcategoria),
      };

      if (producto.categoria_id !== 1) {
        if (this.selectedGenero) {
          producto.genero_id = Number(this.selectedGenero);
        }
        if (this.selectedEditorial) {
          producto.editorial_id = Number(this.selectedEditorial);
        }
        if (this.selectedAutor) {
          producto.autor_id = Number(this.selectedAutor);
        }
      }

      this.productoService.createProducto(producto).subscribe({
        next: (resp: any) => {
          if (resp?.id) {
            this.getProductos();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Producto registrado!",
              showConfirmButton: false,
              timer: 2500
            });
            setTimeout(() => this.closeRegisterProductoModal(), 2600);
          } else {
            Swal.fire("Error al registrar el Producto");
          }
        },
        error: () => Swal.fire("Error al registrar el Producto"),
      });
    },
    error: (e: any) => {
      console.log(e);
      Swal.fire("Error al subir la imagen");
    }
  });
}


  activeRegisterForm() {
    this.isModalRegisterProductoOpen = true;
  }

  openModalToUpdateproducto(producto: any) {
    console.log("Producto recibido:", producto);
    if (!producto) {
      console.error("Producto no definido");
      return;
    }
    this.productoIdSelected = producto.id;
    this.nombreUpdate = producto.nombre || '';
    this.descripcionUpdate = producto.descripcion || '';
    this.imagenUpdate = producto.imagen || '';
    this.precioUpdate = producto.precio || '';
    this.subcategoriaUpdate = producto.subcategoria?.id || 1;
    this.selectedGenero = producto.genero?.id || 1;
    this.selectedAutor = producto.autor?.id || 1;
    this.selectedEditorial = producto.editorial?.id || 1;
    this.stockUpdate = producto.stock || 0;
    // Limpiar archivos seleccionados para nueva imagen (si había)
    this.files = [];
    this.isModalUpdateProductoOpen = true;
  }

  updateproducto() {
    // Si se subió una nueva imagen, la subimos primero
    if (this.files.length > 0) {
      this.upload().subscribe({
        next: (imgUrl: string) => {
          this.enviarActualizacion(imgUrl);
        },
        error: (e: any) => {
          console.log(e);
          Swal.fire("Error al subir la nueva imagen");
        }
      });
    } else {
      // Si no se subió una nueva imagen, usamos la imagen existente
      this.enviarActualizacion(this.imagenUpdate);
    }
  }

 enviarActualizacion(imgUrl: string) {
  const categoriaId = Number(this.subcategoriaUpdate);

  const productoData: any = {
    nombre: this.nombreUpdate,
    descripcion: this.descripcionUpdate,
    imagen: imgUrl,
    precio: this.precioUpdate.toString(),
    stock: Number(this.stockUpdate),
    is_active: this.is_activeUpdate,
    categoria_id: categoriaId,
  };

  if (categoriaId !== 1) {
    if (this.selectedGenero) {
      productoData.genero_id = Number(this.selectedGenero);
    }
    if (this.selectedEditorial) {
      productoData.editorial_id = Number(this.selectedEditorial);
    }
    if (this.selectedAutor) {
      productoData.autor_id = Number(this.selectedAutor);
    }
  }

  this.productoService.updateProducto(this.productoIdSelected, productoData).subscribe({
    next: (resp: any) => {
      if (resp) {
        this.getProductos();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Producto actualizado!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => this.closeUpdateProductoModal(), 2600);
      }
    },
    error: (error: any) => {
      console.log(error);
      Swal.fire("Error al actualizar el producto");
    }
  });
}


  deleteProducto(producto: any) {
    this.productoService.deleteProducto(producto.id).subscribe({
      next: () => {
        this.getProductos();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Producto eliminado!",
          showConfirmButton: false,
          timer: 2500
        });
      },
      error: (error: any) => console.log(error)
    });
  }

  closeRegisterProductoModal() {
    this.isModalRegisterProductoOpen = false;
  }

  closeUpdateProductoModal() {
    this.isModalUpdateProductoOpen = false;
    this.productoIdSelected = null;

    // Reset de campos (si deseas)
    this.nombreUpdate = '';
    this.descripcionUpdate = '';
    this.imagenUpdate = '';
    this.precioUpdate = '';
    this.subcategoriaUpdate = '';
    this.selectedGenero = '';
    this.selectedAutor = '';
    this.selectedEditorial = '';
    this.files = [];
  }

  siguientePagina() {
    if (this.paginaActual * this.itemsPorPagina < this.generos.length) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  // ==================== MÉTODOS PARA OFERTAS ====================

  /**
   * Obtiene todas las ofertas vigentes
   */
  getOfertas(): void {
    this.ofertasService.getOfertasVigentes().subscribe({
      next: (response) => {
        this.ofertas = response.ofertas;
        console.log("Ofertas vigentes:", this.ofertas);
      },
      error: (error) => {
        console.error('Error al obtener ofertas vigentes', error);
        // Fallback: obtener todas las ofertas
        this.ofertasService.getOfertas().subscribe({
          next: (ofertas) => {
            this.ofertas = ofertas;
            console.log("Todas las ofertas:", this.ofertas);
          },
          error: (err) => {
            console.error('Error al obtener ofertas', err);
            this.ofertas = [];
          }
        });
      }
    });
  }

  /**
   * Abre el modal para asignar oferta a un producto
   */
  abrirModalOfertas(producto: any): void {
    this.productoSeleccionadoParaOferta = producto;
    this.ofertaSeleccionada = producto.oferta?.id || null;
    this.isModalOfertasOpen = true;
    
    // Refrescar ofertas por si hay cambios
    this.getOfertas();
  }

  /**
   * Cierra el modal de ofertas
   */
  cerrarModalOfertas(): void {
    this.isModalOfertasOpen = false;
    this.productoSeleccionadoParaOferta = null;
    this.ofertaSeleccionada = null;
  }

  /**
   * Asigna la oferta seleccionada al producto
   */
  asignarOferta(): void {
    if (!this.productoSeleccionadoParaOferta || !this.ofertaSeleccionada) {
      Swal.fire('Error', 'Debe seleccionar una oferta', 'error');
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Asignando oferta...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.ofertasService.aplicarOfertaAProducto(
      this.productoSeleccionadoParaOferta.id, 
      this.ofertaSeleccionada
    ).subscribe({
      next: (response) => {
        Swal.close();
        
        Swal.fire({
          icon: 'success',
          title: '¡Oferta asignada!',
          text: response.mensaje,
          showConfirmButton: true,
          timer: 3000
        });
        
        // Actualizar la lista de productos
        this.getProductos();
        this.cerrarModalOfertas();
      },
      error: (error) => {
        Swal.close();
        console.error('Error al asignar oferta:', error);
        
        let mensaje = 'Error al asignar la oferta';
        if (error.error?.error) {
          mensaje = error.error.error;
        } else if (error.error?.mensaje) {
          mensaje = error.error.mensaje;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje
        });
      }
    });
  }

  /**
   * Quita la oferta del producto
   */
  quitarOferta(): void {
    if (!this.productoSeleccionadoParaOferta) {
      return;
    }

    // Confirmación
    Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea quitar la oferta de este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Quitando oferta...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.ofertasService.quitarOfertaDeProducto(this.productoSeleccionadoParaOferta.id).subscribe({
          next: (response) => {
            Swal.close();
            
            Swal.fire({
              icon: 'success',
              title: '¡Oferta removida!',
              text: response.mensaje,
              showConfirmButton: true,
              timer: 3000
            });
            
            // Actualizar la lista de productos
            this.getProductos();
            this.cerrarModalOfertas();
          },
          error: (error) => {
            Swal.close();
            console.error('Error al quitar oferta:', error);
            
            let mensaje = 'Error al quitar la oferta';
            if (error.error?.error) {
              mensaje = error.error.error;
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: mensaje
            });
          }
        });
      }
    });
  }

  /**
   * Obtiene el estado visual de la oferta del producto
   */
  getEstadoOferta(producto: any): string {
    if (producto.oferta) {
      return this.ofertasService.getEstadoOferta(producto.oferta);
    }
    return 'sin-oferta';
  }

  /**
   * Formatea el descuento para mostrar en Bolivianos
   */
  formatearDescuento(descuento: string): string {
    const descuentoNum = parseFloat(descuento);
    return `Bs ${descuentoNum.toFixed(2)}`;
  }

  /**
   * Calcula el ahorro del producto
   */
  calcularAhorro(producto: any): number {
    if (producto.precio && producto.precio_con_descuento) {
      return this.ofertasService.calcularAhorro(producto.precio, producto.precio_con_descuento);
    }
    return 0;
  }

  /**
   * Calcula el precio con descuento para una oferta específica
   * El descuento viene como valor decimal del backend
   */
  calcularPrecioConDescuento(precio: string, descuento: string): number {
    const precioNum = parseFloat(precio);
    const descuentoNum = parseFloat(descuento);
    // Si el descuento es un valor fijo en Bolivianos, se resta directamente
    return Math.max(0, precioNum - descuentoNum);
  }

  /**
   * Calcula el ahorro para una oferta específica
   * El descuento viene como valor fijo en Bolivianos
   */
  calcularAhorroOferta(precio: string, descuento: string): number {
    const precioNum = parseFloat(precio);
    const descuentoNum = parseFloat(descuento);
    // El ahorro es el valor del descuento, pero no puede ser mayor al precio
    return Math.min(descuentoNum, precioNum);
  }
}
