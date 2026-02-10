<?php
require_once '../../main.inc.php';
global $db;
$sql = "SHOW COLUMNS FROM " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections";
$resql = $db->query($sql);
if ($resql) {
    while ($obj = $db->fetch_object($resql)) {
        echo $obj->Field . "\n";
    }
} else {
    echo "Error: " . $db->lasterror();
}
?>