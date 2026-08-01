<?php
require_once __DIR__ . '/BaseService.php';

class ProductoService extends BaseService
{
    protected string $recurso = '/productos';

    /** Método propio de este servicio (no está en la clase base). */
    public function porCategoria(string $idCategoria): array
    {
        return $this->api->get($this->recurso . '/categoria/' . $idCategoria);
    }
}
