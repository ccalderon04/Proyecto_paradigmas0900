<?php
require_once __DIR__ . '/../core/ApiClient.php';

/** Servicio de autenticación: solo habla con /auth/*, no hereda de BaseService porque no es CRUD. */
class AuthService
{
    private ApiClient $api;

    public function __construct(ApiClient $api)
    {
        $this->api = $api;
    }

    public function login(string $identificador, string $contrasena): array
    {
        return $this->api->post('/auth/login', [
            'identificador' => $identificador,
            'contrasena' => $contrasena,
        ]);
    }
}
