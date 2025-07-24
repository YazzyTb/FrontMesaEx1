import { environment } from '../../environment';

/** Interfaz para parámetros de búsqueda de productos */
export interface ProductSearchParams {
  search?: string;
  category?: string;
  author?: string;
  genre?: string;
  publisher?: string;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
}

/** Interfaz para parámetros de búsqueda de ofertas */
export interface OfferSearchParams {
  active?: boolean;
  upcoming?: boolean;
  expired?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Clase que contiene todos los endpoints de la API
 * Inspirada en la estructura de Flutter para mantener consistencia
 */
export class ApiEndpoints {
  private static readonly BASE_URL = environment.apiUrl;
  
  /** Base path para la API de la librería */
  static readonly LIBRARY_BASE = 'Libreria';

  /** Endpoints de productos */
  static readonly PRODUCTS = `${this.LIBRARY_BASE}/productos/`;
  static readonly PRODUCTS_ON_SALE = `${this.LIBRARY_BASE}/productos/en-oferta/`;

  /** Endpoint de categorías */
  static readonly CATEGORIES = `${this.LIBRARY_BASE}/categorias/`;

  /** Endpoints de autores */
  static readonly AUTHORS = `${this.LIBRARY_BASE}/autores/`;

  /** Endpoints de géneros */
  static readonly GENRES = `${this.LIBRARY_BASE}/generos/`;

  /** Endpoints de editoriales */
  static readonly PUBLISHERS = `${this.LIBRARY_BASE}/editoriales/`;

  /** Endpoints de ofertas */
  static readonly OFFERS = `${this.LIBRARY_BASE}/ofertas/`;
  static readonly ACTIVE_OFFERS = `${this.LIBRARY_BASE}/ofertas/vigentes/`;
  static readonly UPCOMING_OFFERS = `${this.LIBRARY_BASE}/ofertas/proximas/`;
  static readonly EXPIRED_OFFERS = `${this.LIBRARY_BASE}/ofertas/expiradas/`;

  /** Endpoints de carrito */
  static readonly CART = `${this.LIBRARY_BASE}/carrito/activo/`;
  static readonly CART_DETAIL = `${this.LIBRARY_BASE}/detalle-carrito/`;

  /** Endpoints de gestión de carrito */
  static cartUpdatePrices(cartId: number): string {
    return `${this.LIBRARY_BASE}/carrito/${cartId}/actualizar-precios/`;
  }

  static cartEmpty(cartId: number): string {
    return `${this.LIBRARY_BASE}/carrito/${cartId}/vaciar/`;
  }

  static cartConvertToOrder(cartId: number): string {
    return `${this.LIBRARY_BASE}/carrito/${cartId}/convertir-a-pedido/`;
  }

  static cartRecommendations(cartId: number): string {
    return `${this.LIBRARY_BASE}/carrito/${cartId}/recomendaciones/`;
  }

  /** Endpoints de pedidos */
  static readonly ORDERS = `${this.LIBRARY_BASE}/pedidos/`;
  static readonly ORDER_DETAILS = `${this.LIBRARY_BASE}/detalles/`;
  static readonly MY_ORDERS = `${this.LIBRARY_BASE}/pedidos/mis-pedidos/`;

  /** Endpoints de gestión de pedidos */
  static orderRate(orderId: number): string {
    return `${this.LIBRARY_BASE}/pedidos/${orderId}/calificar/`;
  }

  static orderCalculateTotal(orderId: number): string {
    return `${this.LIBRARY_BASE}/pedidos/${orderId}/calcular-total/`;
  }

  /** Endpoints de gestión de productos (para ofertas) */
  static productApplyOffer(productId: number, offerId: number): string {
    return `${this.LIBRARY_BASE}/productos/${productId}/aplicar-oferta/${offerId}/`;
  }

  static productRemoveOffer(productId: number): string {
    return `${this.LIBRARY_BASE}/productos/${productId}/quitar-oferta/`;
  }

  /** Endpoints de gestión de ofertas */
  static offerProducts(offerId: number): string {
    return `${this.LIBRARY_BASE}/ofertas/${offerId}/productos/`;
  }

  static offerAddProducts(offerId: number): string {
    return `${this.LIBRARY_BASE}/ofertas/${offerId}/agregar-productos/`;
  }

  static offerRemoveProducts(offerId: number): string {
    return `${this.LIBRARY_BASE}/ofertas/${offerId}/quitar-productos/`;
  }

  /** Endpoints de Machine Learning */
  static readonly ML_COMBINATIONS = `${this.LIBRARY_BASE}/pedidos/combinaciones-ml/`;
  static readonly ML_COMBINATIONS_DOWNLOAD = `${this.LIBRARY_BASE}/pedidos/descargar-ml-csv/`;

  /** Endpoints de autenticación */
  static readonly LOGIN = `${this.LIBRARY_BASE}/login/`;
  static readonly REGISTER = `${this.LIBRARY_BASE}/usuarios/crear-cliente/`;
  static readonly USERS = `${this.LIBRARY_BASE}/usuarios/`;
  static readonly ROLES = `${this.LIBRARY_BASE}/roles/`;
  static readonly PERMISSIONS = `${this.LIBRARY_BASE}/permisos/`;

  /** Helpers para búsqueda y filtros */
  static productsWithCategory(categoryName: string): string {
    return `${this.PRODUCTS}?categoria=${encodeURIComponent(categoryName)}`;
  }

  static productsWithAuthor(authorName: string): string {
    return `${this.PRODUCTS}?autor=${encodeURIComponent(authorName)}`;
  }

  static productsWithGenre(genreName: string): string {
    return `${this.PRODUCTS}?genero=${encodeURIComponent(genreName)}`;
  }

  static productsWithPublisher(publisherName: string): string {
    return `${this.PRODUCTS}?editorial=${encodeURIComponent(publisherName)}`;
  }

  /** Método para construir URLs complejas de búsqueda de productos */
  static buildProductSearchUrl(params: ProductSearchParams = {}): string {
    const queryParams: string[] = [];

    if (params.search) {
      queryParams.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params.category) {
      queryParams.push(`categoria=${encodeURIComponent(params.category)}`);
    }
    if (params.author) {
      queryParams.push(`autor=${encodeURIComponent(params.author)}`);
    }
    if (params.genre) {
      queryParams.push(`genero=${encodeURIComponent(params.genre)}`);
    }
    if (params.publisher) {
      queryParams.push(`editorial=${encodeURIComponent(params.publisher)}`);
    }
    if (params.onSale === true) {
      queryParams.push('en_oferta=true');
    }
    if (params.minPrice !== undefined) {
      queryParams.push(`precio_min=${params.minPrice}`);
    }
    if (params.maxPrice !== undefined) {
      queryParams.push(`precio_max=${params.maxPrice}`);
    }
    if (params.sortBy) {
      queryParams.push(`ordenar_por=${encodeURIComponent(params.sortBy)}`);
    }
    if (params.sortOrder) {
      queryParams.push(`orden=${encodeURIComponent(params.sortOrder)}`);
    }

    if (queryParams.length === 0) {
      return this.PRODUCTS;
    }

    return `${this.PRODUCTS}?${queryParams.join('&')}`;
  }

  /** Método para construir URLs de filtros de ofertas */
  static buildOfferSearchUrl(params: OfferSearchParams = {}): string {
    const queryParams: string[] = [];

    if (params.active === true) {
      return this.ACTIVE_OFFERS;
    }
    if (params.upcoming === true) {
      return this.UPCOMING_OFFERS;
    }
    if (params.expired === true) {
      return this.EXPIRED_OFFERS;
    }

    if (params.startDate) {
      queryParams.push(`fecha_inicio=${params.startDate.toISOString()}`);
    }
    if (params.endDate) {
      queryParams.push(`fecha_fin=${params.endDate.toISOString()}`);
    }

    if (queryParams.length === 0) {
      return this.OFFERS;
    }

    return `${this.OFFERS}?${queryParams.join('&')}`;
  }

  /** Método helper para obtener URL completa */
  static getFullUrl(endpoint: string): string {
    return `${this.BASE_URL}${endpoint}`;
  }

  /** Método de validación */
  static isValidEndpoint(endpoint: string): boolean {
    return endpoint.startsWith(this.LIBRARY_BASE) && 
           endpoint.length > this.LIBRARY_BASE.length;
  }

  /** Método de debug para listar todos los endpoints disponibles */
  static getAllEndpoints(): Record<string, any> {
    return {
      authentication: {
        login: this.LOGIN,
        register: this.REGISTER,
        users: this.USERS,
        roles: this.ROLES,
        permissions: this.PERMISSIONS,
      },
      products: {
        all: this.PRODUCTS,
        onSale: this.PRODUCTS_ON_SALE,
        categories: this.CATEGORIES,
        authors: this.AUTHORS,
        genres: this.GENRES,
        publishers: this.PUBLISHERS,
      },
      offers: {
        all: this.OFFERS,
        active: this.ACTIVE_OFFERS,
        upcoming: this.UPCOMING_OFFERS,
        expired: this.EXPIRED_OFFERS,
      },
      cart: {
        active: this.CART,
        details: this.CART_DETAIL,
      },
      orders: {
        all: this.ORDERS,
        details: this.ORDER_DETAILS,
        myOrders: this.MY_ORDERS,
      },
      machineLearning: {
        combinations: this.ML_COMBINATIONS,
        download: this.ML_COMBINATIONS_DOWNLOAD,
      },
    };
  }
}
