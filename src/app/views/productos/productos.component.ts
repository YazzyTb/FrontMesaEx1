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
   // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(
    private productoService: ProductosService,
    private autoresService: AutoresService,
    private generosService: GenerosService,
    private editorialesService: EditorialesService,
    private categoriasService: CategoriasService, // Este en realidad es para subcategorías
    private imgdropService: ImgDropService
  ) {
    this.getProductos();
    this.getAutores();
    this.getGeneros();
    this.getEditoriales();
    this.getSubcategorias();
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
}
