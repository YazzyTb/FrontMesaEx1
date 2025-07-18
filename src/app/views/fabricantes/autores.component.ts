import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AutoresService } from '../../core/services/autores.service';

@Component({
  selector: 'app-autores',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './autores.component.html',
  styleUrl: './autores.component.css'
})
export default class AutoresComponent {

  autores: any[] = [];
  autorUpdate: any;
  nuevoAutor: any = { nombre: '' };
  autorIdSelected: any;
  isModalRegisterAutorOpen: boolean = false;
  isModalUpdateAutorOpen: boolean = false;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(private autorService: AutoresService) {}

  ngOnInit(): void {
    this.getAutores();
  }

  getAutores(): void {
    this.autorService.getAutores().subscribe({
      next: (data) => {
        this.autores = data;
      },
      error: (error) => {
        console.error('Error al obtener los autores', error);
      }
    });
  }

  get autoresPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.autores.slice(inicio, inicio + this.itemsPorPagina);
  }

  createAutor(): void {
    if (!this.nuevoAutor.nombre.trim()) {
      Swal.fire("Por favor ingrese el nombre del autor.");
      return;
    }

    const autorData = {
      nombre: this.nuevoAutor.nombre,
      is_active: true
    };

    this.autorService.createAutor(autorData).subscribe({
      next: (data) => {
        this.getAutores();
        this.nuevoAutor = { nombre: '' };
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Autor creado!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => this.closeRegisterAutorModal(), 2600);
      },
      error: (error) => {
        console.error('Error al crear un nuevo autor', error);
        Swal.fire("Error al crear el autor.");
      }
    });
  }

  updateAutor() {
    const autorData = {
      nombre: this.autorUpdate,
    };

    this.autorService.updateAutor(this.autorIdSelected, autorData).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.getAutores();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Autor actualizado!",
            showConfirmButton: false,
            timer: 2500
          });
          setTimeout(() => this.closeUpdateAutorModal(), 2600);
        }
      },
      error: (error: any) => {
        console.log(error);
        Swal.fire("Error al actualizar el autor.");
      }
    });
  }

  deleteAutor(autor: any) {
    this.autorService.deleteAutor(autor.id).subscribe({
      next: () => {
        this.getAutores();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Autor eliminado!",
          showConfirmButton: false,
          timer: 2500
        });
      },
      error: (error: any) => {
        console.log(error);
        Swal.fire("Error al eliminar el autor.");
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterAutorOpen = true;
  }

  openModalToUpdateAutor(autor: any) {
    this.isModalUpdateAutorOpen = true;
    this.autorUpdate = autor.nombre;
    this.autorIdSelected = autor.id;
  }

  closeRegisterAutorModal() {
    this.isModalRegisterAutorOpen = false;
  }

  closeUpdateAutorModal() {
    this.isModalUpdateAutorOpen = false;
  }

  siguientePagina() {
    if (this.paginaActual * this.itemsPorPagina < this.autores.length) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
}
