// src/types/index.ts
export interface Categoria {
    id_categoria: string;
    nombre: string;
}

export interface ProductoCategoria {
    id_categoria: string;
    nombre: string;
}

export interface Producto {
    id_producto: string;
    id_categoria: string;
    nombre: string;
    descripcion: string | null;
    stock: number;
    u_medida: string | null;
    precio: string;
    estado: boolean;
    fecha_registro: string;
    categoria?: ProductoCategoria;
}

export interface MetodoPago {
    id_metodo_pago: string;
    nombre: string;
    activo: boolean;
}

export interface Descuento {
    id_descuento: string;
    nombre: string;
    valor: string;
    tipo: "porcentaje" | "monto_fijo";
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
}

export interface Usuario {
    id_usuario: string;
    nombre: string;
    rol: string;
}

export interface Cliente {
    id_cliente: string;
    id_usuario: string;
    p_nombre: string;
    s_nombre: string | null;
    p_apellido: string;
    s_apellido: string | null;
    fecha_nacimiento: string | null;
    correo: string;
    telefono: string | null;
    genero: string | null;
}

export interface DetalleCarrito {
    id_detalle: string;
    id_producto: string;
    cantidad: number;
}

export interface Carrito {
    id_carrito: string;
    id_cliente: string;
    fecha_creacion: string;
    estado: boolean;
    detalles: DetalleCarrito[];
    subtotal: string;
}

export interface DetalleFactura {
    id_detalle: string;
    id_producto: string;
    cantidad: number;
    id_descuento: string | null;
    total: string;
    estado: boolean;
}

export interface Factura {
    id_factura: string;
    id_cliente: string;
    fecha: string;
    subtotal: string;
    impuestos: string;
    total: string;
    id_metodo_pago: string;
    estado: boolean;
    detalles: DetalleFactura[];
}