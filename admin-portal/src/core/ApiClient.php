<?php

class ApiClient
{
    private string $baseUrl;

    public function __construct(string $baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function get(string $endpoint): array
    {
        return $this->enviar('GET', $endpoint);
    }

    public function post(string $endpoint, array $datos = []): array
    {
        return $this->enviar('POST', $endpoint, $datos);
    }

    public function put(string $endpoint, array $datos = []): array
    {
        return $this->enviar('PUT', $endpoint, $datos);
    }

    public function delete(string $endpoint): array
    {
        return $this->enviar('DELETE', $endpoint);
    }

    /**
     * Hace la petición real con cURL y siempre devuelve el mismo formato,
     * para que el resto del portal no tenga que preocuparse por cURL.
     *
     * @return array{ok: bool, status: int, data: mixed}
     */
    private function enviar(string $metodo, string $endpoint, ?array $datos = null): array
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);

        $opciones = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $metodo,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_TIMEOUT => 15,
        ];

        if ($datos !== null) {
            $opciones[CURLOPT_POSTFIELDS] = json_encode($datos);
        }

        curl_setopt_array($ch, $opciones);

        $respuesta = curl_exec($ch);
        $errorCurl = curl_error($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($respuesta === false) {
            return ['ok' => false, 'status' => 0, 'data' => ['detail' => "No se pudo conectar con el backend: $errorCurl"]];
        }

        $decodificado = json_decode($respuesta, true);

        return [
            'ok' => $status >= 200 && $status < 300,
            'status' => $status,
            'data' => $decodificado ?? [],
        ];
    }
}
