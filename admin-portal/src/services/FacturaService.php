<?php
require_once __DIR__ . '/BaseService.php';

class FacturaService extends BaseService
{
    protected string $recurso = '/facturas';

    public function porCliente(string $idCliente): array
    {
        return $this->api->get($this->recurso . '/cliente/' . $idCliente);
    }
}
