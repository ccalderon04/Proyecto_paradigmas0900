<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::cerrarSesion();
header('Location: login.php');
exit;
