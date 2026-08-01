export interface Producto {
        id_producto: number;
    id_categoria: number;
    nombre: string;
    descripcion: string;
    stock: number;
    u_medida: string;
    precio: number;
    estado: boolean;
    fecha_registro: string;
}

export interface Categoria {
    id_categoria: number;
    nombre: string;
}


export interface DetalleFacturaItem {
    id_producto: number;
    cantidad: number;
    id_descuento?: number | null;
}

export interface FacturaCreate {
    id_cliente: number;
    id_metodo_pago: number;
    entrega_domicilio: boolean;
    detalles: DetalleFacturaItem[];
}

export interface DetalleFacturaResponse {
    id_detalle: number;
    id_producto: number;
    cantidad: number;
    total: number;
}

export interface Factura {
    id_factura: number;
    id_cliente: number;
    fecha: string;
    subtotal: number;
    impuestos: number;
    total: number;
    id_metodo_pago: number;
    estado: boolean;
    detalles?: DetalleFacturaResponse[];
}

export interface Cliente {
    id_cliente: number;
    id_usuario: number;
    p_nombre: string;
    p_apellido: string;
    correo: string;
}