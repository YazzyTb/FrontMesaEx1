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
  autor: any;
  autorUpdate: any;
  nuevoAutor: any = { nombre: '' };
  nombreAutor: string = '';
  autorIdSelected: any;
  isModalRegisterAutorOpen: boolean = false;
  isModalUpdateAutorOpen: boolean = false;

  constructor(private autorService: AutoresService) { }

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

  createAutor(): void {
    if (!this.nuevoAutor.nombre.trim()) {
      Swal.fire("Por favor ingrese el nombre del autor.");
      return;
    }

    const autorData = {
      nombre: this.nuevoAutor.nombre,
      is_active: true
    };

    this.autorService.createAutor(this.nuevoAutor).subscribe({
      next: (data) => {
        this.autores.push(data);
        this.nuevoAutor = { nombre: '' };
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Autor creado!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterAutorModal();
        }, 2600);
      },
      error: (error) => {
        console.error('Error al crear un nuevo autor', error);
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterAutorOpen = true;
  }

  openModalToUpdateAutor(autor: any) {
    console.log('autor id: ' + autor.id);
    this.isModalUpdateAutorOpen = true;
    this.autorUpdate = autor.nombre;
    this.autorIdSelected = autor.id;
  }

  updateAutor() {
    let autorData = {
      nombre: this.autorUpdate,
    };
    this.autorService.updateAutor(this.autorIdSelected, autorData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getAutores();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Usuario actualizado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateAutorModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  deleteAutor(autor: any) {
    this.autorService.deleteAutor(autor.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
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

        }
      }
    );

  }
  closeRegisterAutorModal() {
    this.isModalRegisterAutorOpen = false;
  }

  closeUpdateAutorModal() {
    this.isModalUpdateAutorOpen = false;
  }
}
