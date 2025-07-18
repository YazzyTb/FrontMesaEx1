import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  mostrarSesion = false;
  username: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.obtenerUsuario();
  }

  obtenerUsuario() {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        this.username =
          userObj.username || userObj.email || userObj.nombre_completo || userObj.name || userObj.user;

        if (this.username && this.username.includes('@')) {
          this.username = this.username.split('@')[0];
        }
      } catch (error) {
        console.error('Error al parsear el usuario: ', error);
      }
    }
  }

  irPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  cerrarSesion() {
    this.authService.logout();
  }

  toggleSesion() {
    this.mostrarSesion = !this.mostrarSesion;
    if (this.mostrarSesion) this.obtenerUsuario();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sesion-div') && !target.closest('.boton-sesion')) {
      this.mostrarSesion = false;
    }
  }
}
