<?php
require_once __DIR__ . '/BaseService.php';

class CompraService extends BaseService
{
    protected string $recurso = '/compras';
    // Las compras no se editan ni se borran (son un registro histórico),
    // así que este servicio solo usa listar() y crear() de la clase base.
}
