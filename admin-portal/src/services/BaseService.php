<?php
require_once __DIR__ . '/../core/ApiClient.php';

/**
 * Clase base abstracta: agrupa las operaciones CRUD comunes a casi todos
 * los recursos del backend (listar/obtener/crear/actualizar/eliminar).
 */
abstract class BaseService
{
    protected ApiClient $api;
    protected string $recurso; // ej. "/categorias"

    public function __construct(ApiClient $api)
    {
        $this->api = $api;
    }

    public function listar(): array
    {
        return $this->api->get($this->recurso . '/');
    }

    public function obtener(string $id): array
    {
        return $this->api->get($this->recurso . '/' . $id);
    }

    public function crear(array $datos): array
    {
        return $this->api->post($this->recurso . '/', $datos);
    }

    public function actualizar(string $id, array $datos): array
    {
        return $this->api->put($this->recurso . '/' . $id, $datos);
    }

    public function eliminar(string $id): array
    {
        return $this->api->delete($this->recurso . '/' . $id);
    }
}
