import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { CategoriasService } from '../../core/services/categorias.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export default class CategoriasComponent implements OnInit {

  categorias: any[] = [];

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  // Formularios y modales
  nuevoCategoria: any = { nombre: '' };
  categoriaUpdate: string = '';
  categoriaIdSelected: number | null = null;

  isModalRegisterCategoriaOpen: boolean = false;
  isModalUpdateCategoriaOpen: boolean = false;

  constructor(private categoriaService: CategoriasService) {}

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al obtener las Categorias', error);
      }
    });
  }

  activeRegisterForm(): void {
    this.nuevoCategoria = { nombre: '' };
    this.isModalRegisterCategoriaOpen = true;
  }

  closeRegisterCategoriaModal(): void {
    this.isModalRegisterCategoriaOpen = false;
  }

  createCategoria(): void {
    if (!this.nuevoCategoria.nombre.trim()) return;

    const payload = {
      nombre: this.nuevoCategoria.nombre.trim(),
      categoria: 1 // puedes ajustarlo según tu lógica
    };

    this.categoriaService.createCategoria(payload).subscribe({
      next: (data) => {
        this.getCategorias();
        this.nuevoCategoria = { nombre: '' };
        Swal.fire({
          icon: 'success',
          title: 'Categoría registrada',
          showConfirmButton: false,
          timer: 2000
        });
        this.closeRegisterCategoriaModal();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar categoría',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  openModalToUpdateCategoria(categoria: any): void {
    this.categoriaUpdate = categoria.nombre;
    this.categoriaIdSelected = categoria.id;
    this.isModalUpdateCategoriaOpen = true;
  }

  closeUpdateCategoriaModal(): void {
    this.isModalUpdateCategoriaOpen = false;
  }

  updateCategoria(): void {
    if (!this.categoriaUpdate.trim() || this.categoriaIdSelected === null) return;

    const payload = {
      nombre: this.categoriaUpdate.trim(),
      categoria: 1
    };

    this.categoriaService.updateCategoria(this.categoriaIdSelected, payload).subscribe({
      next: () => {
        this.getCategorias();
        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada',
          showConfirmButton: false,
          timer: 2000
        });
        this.closeUpdateCategoriaModal();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar categoría',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  deleteCategoria(categoria: any): void {
    this.categoriaService.deleteCategoria(categoria.id).subscribe({
      next: () => {
        this.getCategorias();
        Swal.fire({
          icon: 'success',
          title: 'Categoría eliminada',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar categoría',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}
