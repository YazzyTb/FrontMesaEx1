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
          categoria: { nombre: "", is_active: true }, // puedes poner "" o recuperar el nombre desde la lista
          genero_id: null,
          genero: null,
          editorial_id: null,
          editorial: null,
          autor_id: null,
          autor: null
        };
        // Si la subcategoría es distinta de 1 (no es accesorio), asignar los valores normalmente
        if (producto.categoria_id !== 1) {
          producto.genero_id = this.selectedGenero !== "" ? Number(this.selectedGenero) : null;
          producto.editorial_id = this.selectedEditorial !== "" ? Number(this.selectedEditorial) : null;
          producto.autor_id = this.selectedAutor !== "" ? Number(this.selectedAutor) : null;

          // puedes obtener el nombre desde tu lista local si quieres, ejemplo:
          producto.genero = { nombre: this.generosMap[producto.genero_id], is_active: true };
          producto.editorial = { nombre: this.editorialesMap[producto.editorial_id], is_active: true };
          producto.autor = { nombre: this.autoresMap[producto.autor_id], is_active: true };
        }
        console.log(producto);
        this.productoService.createProducto(producto).subscribe({
          next: (resp: any) => {
            if (resp.id || resp.id >= 1) {
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
              Swal.fire({
                position: "center",
                icon: "error",
                title: "Error al registrar el Producto!",
                showConfirmButton: false,
                timer: 2500
              });
            }
          },
          error: () => {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Error al registrar el Producto!",
              showConfirmButton: false,
              timer: 2500
            });
          }
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
      categoria: {
        nombre: this.subcategorias[categoriaId] || "",
        is_active: true
      },
      genero_id: null,
      genero: null,
      editorial_id: null,
      editorial: null,
      autor_id: null,
      autor: null
    };

    // Solo si NO es accesorio
    if (categoriaId !== 1) {
      productoData.genero_id = Number(this.selectedGenero);
      productoData.genero = {
        nombre: this.generosMap[productoData.genero_id] || "",
        is_active: true
      };

      productoData.editorial_id = Number(this.selectedEditorial);
      productoData.editorial = {
        nombre: this.editorialesMap[productoData.editorial_id] || "",
        is_active: true
      };

      productoData.autor_id = Number(this.selectedAutor);
      productoData.autor = {
        nombre: this.autoresMap[productoData.autor_id] || "",
        is_active: true
      };
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
}
