<?php
require_once __DIR__ . '/../core/ApiClient.php';

class AuthService
{
    private ApiClient $api;

    public function __construct(ApiClient $api)
    {
        $this->api = $api;
    }

    public function login(string $nombre, string $contrasena): array
    {
        return $this->api->post('/usuarios/login', [
            'nombre' => $nombre,
            'contrasena' => $contrasena,
        ]);
    }
}