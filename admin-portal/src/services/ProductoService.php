<?php
require_once __DIR__ . '/BaseService.php';

class ProductoService extends BaseService
{
    protected string $recurso = '/productos';

    public function listar(): array
    {
        return $this->api->get($this->recurso . '/?solo_activos=false');
    }

    public function porCategoria(string $idCategoria): array
    {
        return $this->api->get($this->recurso . '/categoria/' . $idCategoria);
    }
}