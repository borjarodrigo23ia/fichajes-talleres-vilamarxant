<?php
require_once '../../main.inc.php';
global $db;
$sql = "ALTER TABLE " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections ADD COLUMN IF NOT EXISTS date_creation DATETIME NOT NULL AFTER estado";
$resql = $db->query($sql);
if ($resql) {
    echo "Column date_creation added or already exists.\n";
} else {
    echo "Error adding date_creation: " . $db->lasterror() . "\n";
}

$sql = "ALTER TABLE " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections ADD COLUMN IF NOT EXISTS date_approval DATETIME AFTER fk_approver";
$resql = $db->query($sql);
if ($resql) {
    echo "Column date_approval added or already exists.\n";
} else {
    echo "Error adding date_approval: " . $db->lasterror() . "\n";
}
?>