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
    id_descuento: string | null;
    nombre: string;
    descripcion: string | null;
    stock: number;
    cantidad: string | null;
    u_medida: string | null;
    precio: string;
    estado: boolean;
    fecha_registro: string;
    categoria?: ProductoCategoria;
    descuento?: ProductoDescuento | null;
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

export interface ProductoDescuento {
  id_descuento: string;
  nombre: string;
  valor: string;
  tipo: "porcentaje" | "monto_fijo";
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface Departamento {
  id_departamento: string;
  nombre: string;
}

export interface Ciudad {
  id_ciudad: string;
  nombre: string;
}

export interface Direccion {
  id_direccion: string;
  id_cliente: string;
  id_departamento: string;
  id_ciudad: string;
  calle: string;
  colonia: string;
  lat: string | null;
  long: string | null;
}

export interface Tarjeta {
  id_tarjeta: string;
  id_cliente: string;
  titular: string;
  ultimos_digitos: string;
  marca: "Visa" | "Mastercard" | "Amex";
  fecha_expiracion: string;
  estado: boolean;
}