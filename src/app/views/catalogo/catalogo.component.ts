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
  isAdmin: boolean = false; // Asegúrate de controlar si el usuario es administrador
  generos: Array<any> = [];
  autores: Array<any> = [];
  editoriales: Array<any> = [];
  subcategorias: Array<any> = [];
  categoriasMap: { [key: number]: string } = {};
  generosMap: { [key: number]: string } = {};
  autoresMap: { [key: number]: string } = {};
  editorialesMap: { [key: number]: string } = {};

  constructor(private productosService: ProductosService, private autoresService: AutoresService,
    private generosService: GenerosService,
    private editorialesService: EditorialesService,
    private categoriasService: CategoriasService,
    private carritoService: CarritoService,
    private detalleCarritoService: DetalleCarritoService) { }

  ngOnInit() {
    this.getProductos();
    this.getAutores();
    this.getGeneros();
    this.getEditoriales();
    this.getSubcategorias();
    this.obtenerCarritoActivo();
  }

  getProductos(): void {
    this.productosService.getProductos().subscribe(
      (productos) => {
        this.productos = productos.filter(producto => producto.is_active); // Filtrar solo productos activos
        console.log('Productos después del filtrado:', this.productos); // Verifica los productos que llegan al frontend
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

  agregarProducto(producto: Producto): void {
    const detalle = {
      producto_id: producto.id,
      cantidad: producto.cantidad || 1
    };

    this.detalleCarritoService.agregarProducto(detalle).subscribe({
      next: () => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Producto agregado al carrito!",
          showConfirmButton: false,
          timer: 1000
        });
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
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
}