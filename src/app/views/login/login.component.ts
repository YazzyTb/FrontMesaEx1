import { Component } from '@angular/core';
import { AuthService } from './../../core/services/auth.service';
import { UserService } from './../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {
  username: any;
  password: any;
  isModalRegisterUserOpen: boolean = false;
  email: any;
  telefono: any;
  direccion: any;
  selectedRole: any = "";

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {
  }
  login() {
    console.log("Botón presionado");
    let user = {
      username: this.email,
      password: this.password
    };
    this.authService.login(user).subscribe({
      next: (resp: any) => {
        console.log(resp);
        if (resp.token && resp.token !== '') {
          sessionStorage.setItem("token", resp.token);
          sessionStorage.setItem("user_id", resp.user_id);
          sessionStorage.setItem("user", JSON.stringify({ username: resp.username }));
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Usuario logueado exitosamente",
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/usuarios']);
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Token no recibido",
            showConfirmButton: false,
            timer: 2000
          });
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Credenciales inválidas",
          text: "Verifica usuario y contraseña",
          showConfirmButton: true
        });
      }
    });
  }
  activeRegisterForm() {
    this.isModalRegisterUserOpen = true;
  }

  closeRegisterUserModal() {
    this.isModalRegisterUserOpen = false;
  }
  registerUser() {
    let user = {
      nombre_completo: this.username,
      password: this.password,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion
    };
    this.userService.registrarCliente(user).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp.id || resp.id >= 1) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Bienvenido " + this.username + "!",
              showConfirmButton: false,
              timer: 2500
            });
            setTimeout(() => {
              this.closeRegisterUserModal();
            }, 2600);
          } else {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Tuvimos un error al registrarte, por favor, verifica tus datos!",
              showConfirmButton: false,
              timer: 2500
            });
          }
        },
        error: (error: any) => {
          console.log('Error al registrar usuario:', error);
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Error al registrar el usuario!",
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    );
  }
}
