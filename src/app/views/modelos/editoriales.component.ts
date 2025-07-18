import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { EditorialesService } from '../../core/services/editoriales.service';

@Component({
  selector: 'app-editoriales',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editoriales.component.html',
  styleUrl: './editoriales.component.css'
})
export default class EditorialesComponent {

  editoriales: any[] = [];
  editorial: any;
  editorialUpdate: any;
  nuevoEditorial: any = { nombre: '' };
  nombreEditorial: string = '';
  editorialIdSelected: any;
  isModalRegisterEditorialOpen: boolean = false;
  isModalUpdateEditorialOpen: boolean = false;
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(private editorialService: EditorialesService) { }

  ngOnInit(): void {
    this.getEditoriales();
  }

  getEditoriales(): void {
    this.editorialService.getEditoriales().subscribe({
      next: (data) => {
        this.editoriales = data;
      },
      error: (error) => {
        console.error('Error al obtener las editoriales', error);
      }
    });
  }

  createEditorial(): void {
    if (!this.nuevoEditorial.nombre.trim()) return;
    this.editorialService.createEditorial(this.nuevoEditorial).subscribe({
      next: (data) => {
        this.editoriales.push(data);
        this.nuevoEditorial = { nombre: '' };
        this.getEditoriales();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Editorial registrado!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterEditorialModal();
        }, 2600);
      },
      error: (error: any) => {
        console.log('Error al registrar el editorial:', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error al registrar el editorial!",
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterEditorialOpen = true;
  }

  openModalToUpdateEditorial(editorial: any) {
    console.log('editorial id: ' + editorial.id);
    this.isModalUpdateEditorialOpen = true;
    this.editorialUpdate = editorial.nombre;
    this.editorialIdSelected = editorial.id;
  }

  updateEditorial() {
    let editorialData = {
      nombre: this.editorialUpdate,
    };
    this.editorialService.updateEditorial(this.editorialIdSelected, editorialData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getEditoriales();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Editorial actualizado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateEditorialModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  deleteEditorial(editorial: any) {
    this.editorialService.deleteEditorial(editorial.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.getEditoriales();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Editorial eliminado!",
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
  closeRegisterEditorialModal() {
    this.isModalRegisterEditorialOpen = false;
  }

  closeUpdateEditorialModal() {
    this.isModalUpdateEditorialOpen = false;
  }

    siguientePagina() {
    if (this.paginaActual * this.itemsPorPagina < this.editoriales.length) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
}

