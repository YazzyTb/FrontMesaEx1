// Ejemplo de uso de ApiEndpoints en los servicios

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints, ProductSearchParams, OfferSearchParams } from './api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ExampleService {
  
  constructor(private http: HttpClient) {}

  // Ejemplo 1: Obtener todos los productos
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(ApiEndpoints.PRODUCTS));
  }

  // Ejemplo 2: Buscar productos con filtros complejos
  searchProducts(searchTerm: string, category?: string): Observable<any[]> {
    const searchParams: ProductSearchParams = {
      search: searchTerm,
      category: category,
      sortBy: 'nombre',
      sortOrder: 'asc'
    };
    
    const url = ApiEndpoints.buildProductSearchUrl(searchParams);
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 3: Obtener productos en oferta con filtros de precio
  getProductsOnSale(minPrice?: number, maxPrice?: number): Observable<any[]> {
    const searchParams: ProductSearchParams = {
      onSale: true,
      minPrice: minPrice,
      maxPrice: maxPrice,
      sortBy: 'precio',
      sortOrder: 'asc'
    };
    
    const url = ApiEndpoints.buildProductSearchUrl(searchParams);
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 4: Obtener productos por autor específico
  getProductsByAuthor(authorName: string): Observable<any[]> {
    const url = ApiEndpoints.productsWithAuthor(authorName);
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 5: Gestión de carrito - vaciar carrito
  emptyCart(cartId: number): Observable<any> {
    const url = ApiEndpoints.cartEmpty(cartId);
    return this.http.delete(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 6: Convertir carrito a pedido
  convertCartToOrder(cartId: number): Observable<any> {
    const url = ApiEndpoints.cartConvertToOrder(cartId);
    return this.http.post(ApiEndpoints.getFullUrl(url), {});
  }

  // Ejemplo 7: Obtener ofertas activas
  getActiveOffers(): Observable<any[]> {
    const searchParams: OfferSearchParams = { active: true };
    const url = ApiEndpoints.buildOfferSearchUrl(searchParams);
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 8: Aplicar oferta a producto
  applyOfferToProduct(productId: number, offerId: number): Observable<any> {
    const url = ApiEndpoints.productApplyOffer(productId, offerId);
    return this.http.post(ApiEndpoints.getFullUrl(url), {});
  }

  // Ejemplo 9: Obtener recomendaciones del carrito
  getCartRecommendations(cartId: number): Observable<any[]> {
    const url = ApiEndpoints.cartRecommendations(cartId);
    return this.http.get<any[]>(ApiEndpoints.getFullUrl(url));
  }

  // Ejemplo 10: Verificar si un endpoint es válido (para debugging)
  validateEndpoint(endpoint: string): boolean {
    return ApiEndpoints.isValidEndpoint(endpoint);
  }

  // Ejemplo 11: Debug - obtener todos los endpoints disponibles
  getAllAvailableEndpoints(): Record<string, any> {
    return ApiEndpoints.getAllEndpoints();
  }
}

// Ejemplo de uso en componente
/*
import { Component, OnInit } from '@angular/core';
import { ExampleService } from './example.service';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h3>Productos encontrados: {{ products.length }}</h3>
      <div *ngFor="let product of products">
        {{ product.nombre }} - ${{ product.precio }}
      </div>
    </div>
  `
})
export class ExampleComponent implements OnInit {
  products: any[] = [];

  constructor(private exampleService: ExampleService) {}

  ngOnInit() {
    // Buscar productos con filtros
    this.exampleService.searchProducts('Harry Potter', 'Fantasía')
      .subscribe({
        next: (products) => {
          this.products = products;
          console.log('Productos encontrados:', products);
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
        }
      });
  }

  onSearchProducts() {
    // Búsqueda avanzada con múltiples filtros
    this.exampleService.getProductsOnSale(10, 50)
      .subscribe(products => {
        this.products = products;
      });
  }
}
*/
