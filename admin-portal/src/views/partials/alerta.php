<?php

if (!empty($error)): ?>
    <div class="alerta alerta--error"><?= htmlspecialchars($error) ?></div>
<?php endif;
if (!empty($exito)): ?>
    <div class="alerta alerta--ok"><?= htmlspecialchars($exito) ?></div>
<?php endif; ?>
