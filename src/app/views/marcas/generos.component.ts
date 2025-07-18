import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { GenerosService } from '../../core/services/generos.service';

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './generos.component.html',
  styleUrl: './generos.component.css'
})
export default class GenerosComponent {

  generos: any[] = [];
  genero: any;
  generoUpdate: any;
  nuevoGenero: any = { nombre: '' };
  nombreGenero: string = '';
  generoIdSelected: any;
  isModalRegisterGeneroOpen: boolean = false;
  isModalUpdateGeneroOpen: boolean = false;
 // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;
  constructor(private generoService: GenerosService) { }

  ngOnInit(): void {
    this.getGeneros();
  }

  getGeneros(): void {
    this.generoService.getGeneros().subscribe({
      next: (data) => {
        this.generos = data;
      },
      error: (error) => {
        console.error('Error al obtener los generos', error);
      }
    });
  }

  createGenero(): void {
    if (!this.nuevoGenero.nombre.trim()) return;
    this.generoService.createGenero(this.nuevoGenero).subscribe({
      next: (data) => {
        this.generos.push(data);
        this.nuevoGenero = { nombre: '' };
        this.getGeneros();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Genero registrado!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterGeneroModal();
        }, 2600);
      },
      error: (error: any) => {
        console.log('Error al registrar el genero:', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error al registrar el genero!",
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterGeneroOpen = true;
  }

  openModalToUpdateGenero(genero: any) {
    console.log('genero id: ' + genero.id);
    this.isModalUpdateGeneroOpen = true;
    this.generoUpdate = genero.nombre;
    this.generoIdSelected = genero.id;
  }

  updateGenero() {
    let generoData = {
      nombre: this.generoUpdate,
    };
    this.generoService.updateGenero(this.generoIdSelected, generoData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getGeneros();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Genero actualizado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateGeneroModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  deleteGenero(genero: any) {
    this.generoService.deleteGenero(genero.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.getGeneros();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Genero eliminado!",
            showConfirmButton: false,
            timer: 2500
          });
        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );

  }
  closeRegisterGeneroModal() {
    this.isModalRegisterGeneroOpen = false;
  }

  closeUpdateGeneroModal() {
    this.isModalUpdateGeneroOpen = false;
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
