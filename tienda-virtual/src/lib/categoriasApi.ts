import { apiFetch } from "./apiClient";
import { Categoria } from "@/types";

export const obtenerCategorias = () => apiFetch<Categoria[]>("/categorias/");