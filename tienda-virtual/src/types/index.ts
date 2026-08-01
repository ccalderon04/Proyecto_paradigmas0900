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