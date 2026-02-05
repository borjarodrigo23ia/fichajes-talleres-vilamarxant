<?php
/* Copyright (C) 2025
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file       htdocs/custom/fichajestrabajadores/class/vacaciones_dias.class.php
 * \ingroup    fichajestrabajadores
 * \brief      Clase para gestionar los días de vacaciones permitidos por usuario y año
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';

class VacacionesDias
{
    /**
     * @var DoliDB
     */
    public $db;

    /** @var array */
    public $errors = array();

    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Asegura que exista un registro para un usuario y año; si no existe, lo crea con dias=0
     */
    public function ensureRowForUserYear($userId, $year, $entity = 1)
    {
        $userId = (int)$userId;
        $year = (int)$year;
        $entity = (int)$entity;

        $sql = "SELECT rowid FROM " . MAIN_DB_PREFIX . "fichajestrabajadores_vacaciones_dias WHERE fk_user = " . $userId . " AND anio = " . $year . " AND entity = " . $entity;
        $res = $this->db->query($sql);
        if ($res && $this->db->num_rows($res) > 0) {
            return 1;
        }

        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "fichajestrabajadores_vacaciones_dias (fk_user, anio, dias, datec, entity) VALUES (" . $userId . ", " . $year . ", 0, NOW(), " . $entity . ")";
        $res = $this->db->query($sql);
        if ($res) return 1;

        $this->errors[] = $this->db->lasterror();
        return -1;
    }

    /**
     * Backfill: garantiza registros para todos los usuarios del año dado.
     */
    public function backfillForYear($year, $entity = 1)
    {
        $year = (int)$year;
        $entity = (int)$entity;

        $sql = "SELECT u.rowid AS fk_user FROM " . MAIN_DB_PREFIX . "user u WHERE u.entity IN (" . $entity . ")";
        $res = $this->db->query($sql);
        if (!$res) {
            $this->errors[] = $this->db->lasterror();
            return -1;
        }
        $created = 0;
        while ($obj = $this->db->fetch_object($res)) {
            $r = $this->ensureRowForUserYear($obj->fk_user, $year, $entity);
            if ($r < 0) return -1;
            if ($r === 1) $created++;
        }
        return $created;
    }

    /**
     * Obtiene lista de días por usuario y año (join con user)
     */
    public function listByYear($year, $entity = 1)
    {
        $year = (int)$year;
        $entity = (int)$entity;
        $sql = "SELECT d.rowid, d.fk_user, d.anio, d.dias, u.login, u.lastname, u.firstname " .
               "FROM " . MAIN_DB_PREFIX . "fichajestrabajadores_vacaciones_dias d " .
               "JOIN " . MAIN_DB_PREFIX . "user u ON u.rowid = d.fk_user " .
               "WHERE d.anio = " . $year . " AND d.entity = " . $entity . " ORDER BY u.lastname, u.firstname";
        $res = $this->db->query($sql);
        if (!$res) {
            $this->errors[] = $this->db->lasterror();
            return array();
        }
        $rows = array();
        while ($obj = $this->db->fetch_object($res)) {
            $rows[] = $obj;
        }
        return $rows;
    }

    /**
     * Upsert de días para un usuario/año
     */
    public function setDays($userId, $year, $days, $entity = 1)
    {
        $userId = (int)$userId;
        $year = (int)$year;
        $days = (int)$days;
        $entity = (int)$entity;

        $this->ensureRowForUserYear($userId, $year, $entity);

        $sql = "UPDATE " . MAIN_DB_PREFIX . "fichajestrabajadores_vacaciones_dias SET dias = " . $days . " WHERE fk_user = " . $userId . " AND anio = " . $year . " AND entity = " . $entity;
        $res = $this->db->query($sql);
        if ($res) return 1;

        $this->errors[] = $this->db->lasterror();
        return -1;
    }
}


