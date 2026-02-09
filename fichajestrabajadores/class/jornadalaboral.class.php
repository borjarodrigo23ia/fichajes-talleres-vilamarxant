<?php
/* Copyright (C) 2024
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 *  \file       htdocs/custom/fichajestrabajadores/class/jornadalaboral.class.php
 *  \ingroup    fichajestrabajadores
 *  \brief      Clase para gestionar jornadas laborales (horarios habituales) de trabajadores
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';
require_once DOL_DOCUMENT_ROOT . '/user/class/user.class.php';

/**
 * Clase para gestionar jornadas laborales (horarios habituales)
 */
class JornadaLaboral
{
    /** @var DoliDB */
    public $db;

    /** @var string */
    public $error;

    /** @var array */
    public $errors = array();

    /** @var int ID de jornada */
    public $id;

    /** @var int ID del usuario */
    public $fk_user;

    /** @var string Tipo de jornada: intensiva o partida */
    public $tipo_jornada;

    /** @var string Tipo de turno: fijo o rotativo */
    public $tipo_turno;

    /** @var string Hora inicio jornada (HH:MM:SS) */
    public $hora_inicio_jornada;

    /** @var string Hora fin jornada (HH:MM:SS) */
    public $hora_fin_jornada;

    /** @var array Array of break periods */
    public $pausas = array();

    /** @var string Observaciones */
    public $observaciones;

    /** @var int Timestamp fecha de creación */
    public $fecha_creacion;

    /** @var int Estado activo */
    public $active;

    /**
     * Constructor
     *
     * @param DoliDB $db Database handler
     */
    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Crear una jornada laboral
     *
     * @param int   $fk_user ID de usuario
     * @param array $data    Datos de la jornada
     * @return int           ID de jornada (>0) o <0 si error
     */
    public function create($fk_user, $data = array())
    {
        $this->errors = array();
        $this->error = '';

        $this->fk_user = (int) $fk_user;
        $this->tipo_jornada = isset($data['tipo_jornada']) ? $data['tipo_jornada'] : 'partida';
        $this->tipo_turno = isset($data['tipo_turno']) ? $data['tipo_turno'] : 'fijo';
        $this->hora_inicio_jornada = isset($data['hora_inicio_jornada']) ? $data['hora_inicio_jornada'] : null;
        $this->hora_fin_jornada = isset($data['hora_fin_jornada']) ? $data['hora_fin_jornada'] : null;
        $this->observaciones = isset($data['observaciones']) ? $data['observaciones'] : null;
        $this->active = 1;

        // Get pausas array if provided
        $pausas = isset($data['pausas']) && is_array($data['pausas']) ? $data['pausas'] : array();

        if (empty($this->fk_user)) {
            $this->errors[] = 'Usuario no especificado';
            return -1;
        }
        if (empty($this->hora_inicio_jornada) || empty($this->hora_fin_jornada)) {
            $this->errors[] = 'Faltan datos obligatorios para la jornada';
            return -2;
        }

        $this->db->begin();

        // Insert main shift record
        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "jornadas_laborales(";
        $sql .= "fk_user, tipo_jornada, tipo_turno, hora_inicio_jornada, hora_fin_jornada, observaciones, active";
        $sql .= ") VALUES(";
        $sql .= (int) $this->fk_user . ",";
        $sql .= "'" . $this->db->escape($this->tipo_jornada) . "',";
        $sql .= "'" . $this->db->escape($this->tipo_turno) . "',";
        $sql .= "'" . $this->db->escape($this->hora_inicio_jornada) . "',";
        $sql .= "'" . $this->db->escape($this->hora_fin_jornada) . "',";
        $sql .= ($this->observaciones ? "'" . $this->db->escape($this->observaciones) . "'" : "NULL") . ",";
        $sql .= "1";
        $sql .= ")";

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = "Error al insertar registro: " . $this->db->lasterror();
            $this->errors[] = $this->error;
            $this->db->rollback();
            return -3;
        }

        $this->id = $this->db->last_insert_id(MAIN_DB_PREFIX . "jornadas_laborales");

        // Insert break periods if provided
        if (!empty($pausas)) {
            foreach ($pausas as $index => $pausa) {
                if (empty($pausa['hora_inicio']) || empty($pausa['hora_fin'])) {
                    continue; // Skip invalid breaks
                }

                $descripcion = isset($pausa['descripcion']) ? $pausa['descripcion'] : '';
                $orden = isset($pausa['orden']) ? (int) $pausa['orden'] : $index;

                $sqlPausa = "INSERT INTO " . MAIN_DB_PREFIX . "jornadas_pausas(";
                $sqlPausa .= "fk_jornada, hora_inicio, hora_fin, descripcion, orden";
                $sqlPausa .= ") VALUES(";
                $sqlPausa .= (int) $this->id . ",";
                $sqlPausa .= "'" . $this->db->escape($pausa['hora_inicio']) . "',";
                $sqlPausa .= "'" . $this->db->escape($pausa['hora_fin']) . "',";
                $sqlPausa .= ($descripcion ? "'" . $this->db->escape($descripcion) . "'" : "NULL") . ",";
                $sqlPausa .= $orden;
                $sqlPausa .= ")";

                $resPausa = $this->db->query($sqlPausa);
                if (!$resPausa) {
                    $this->error = "Error al insertar pausa: " . $this->db->lasterror();
                    $this->errors[] = $this->error;
                    $this->db->rollback();
                    return -4;
                }
            }
        }

        $this->db->commit();
        return $this->id;
    }

    /**
     * Cargar una jornada laboral
     *
     * @param int $id ID de jornada
     * @return int    1 si ok, 0 si no encontrada, <0 si error
     */
    public function fetch($id)
    {
        $sql = "SELECT j.*";
        $sql .= " FROM " . MAIN_DB_PREFIX . "jornadas_laborales as j";
        $sql .= " WHERE j.rowid = " . ((int) $id);

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = "Error al leer datos: " . $this->db->lasterror();
            return -1;
        }

        if (!$this->db->num_rows($resql)) {
            $this->db->free($resql);
            return 0;
        }

        $obj = $this->db->fetch_object($resql);

        $this->id = $obj->rowid;
        $this->fk_user = $obj->fk_user;
        $this->tipo_jornada = $obj->tipo_jornada;
        $this->tipo_turno = $obj->tipo_turno;
        $this->hora_inicio_jornada = $obj->hora_inicio_jornada;
        $this->hora_fin_jornada = $obj->hora_fin_jornada;
        $this->observaciones = $obj->observaciones;
        $this->fecha_creacion = $this->db->jdate($obj->fecha_creacion);
        $this->active = $obj->active;

        $this->db->free($resql);

        // Fetch break periods
        $this->pausas = array();
        $sqlPausas = "SELECT rowid, hora_inicio, hora_fin, descripcion, orden";
        $sqlPausas .= " FROM " . MAIN_DB_PREFIX . "jornadas_pausas";
        $sqlPausas .= " WHERE fk_jornada = " . ((int) $this->id);
        $sqlPausas .= " ORDER BY orden ASC, hora_inicio ASC";

        $resPausas = $this->db->query($sqlPausas);
        if ($resPausas) {
            while ($objPausa = $this->db->fetch_object($resPausas)) {
                $this->pausas[] = array(
                    'id' => $objPausa->rowid,
                    'hora_inicio' => $objPausa->hora_inicio,
                    'hora_fin' => $objPausa->hora_fin,
                    'descripcion' => $objPausa->descripcion,
                    'orden' => $objPausa->orden
                );
            }
            $this->db->free($resPausas);
        }

        return 1;
    }

    /**
     * Actualizar una jornada laboral
     *
     * @param int   $id   ID de jornada
     * @param array $data Datos a actualizar
     * @return int        >0 si ok, <0 si error
     */
    public function update($id, $data = array())
    {
        $this->errors = array();
        $this->error = '';

        $res = $this->fetch($id);
        if ($res <= 0) {
            $this->errors[] = 'Jornada no encontrada';
            return -1;
        }

        $this->db->begin();

        // Build UPDATE for main table
        $update = array();

        if (isset($data['tipo_jornada'])) {
            $update[] = "tipo_jornada = '" . $this->db->escape($data['tipo_jornada']) . "'";
        }
        if (isset($data['tipo_turno'])) {
            $update[] = "tipo_turno = '" . $this->db->escape($data['tipo_turno']) . "'";
        }
        if (isset($data['hora_inicio_jornada'])) {
            $update[] = "hora_inicio_jornada = '" . $this->db->escape($data['hora_inicio_jornada']) . "'";
        }
        if (isset($data['hora_fin_jornada'])) {
            $update[] = "hora_fin_jornada = '" . $this->db->escape($data['hora_fin_jornada']) . "'";
        }
        if (array_key_exists('observaciones', $data)) {
            $update[] = "observaciones = " . ($data['observaciones'] !== null && $data['observaciones'] !== '' ? "'" . $this->db->escape($data['observaciones']) . "'" : "NULL");
        }

        if (!empty($update)) {
            $sql = "UPDATE " . MAIN_DB_PREFIX . "jornadas_laborales SET ";
            $sql .= implode(', ', $update);
            $sql .= " WHERE rowid = " . ((int) $id);

            dol_syslog(__METHOD__ . " - update SQL: " . $sql, LOG_DEBUG);

            $resql = $this->db->query($sql);
            if (!$resql) {
                $this->error = "Error al actualizar jornada: " . $this->db->lasterror();
                $this->errors[] = $this->error;
                $this->db->rollback();
                return -2;
            }
        }

        // Update break periods if provided
        if (isset($data['pausas']) && is_array($data['pausas'])) {
            // Delete all existing breaks for this shift
            $sqlDel = "DELETE FROM " . MAIN_DB_PREFIX . "jornadas_pausas WHERE fk_jornada = " . ((int) $id);
            $this->db->query($sqlDel);

            // Insert new breaks
            foreach ($data['pausas'] as $index => $pausa) {
                if (empty($pausa['hora_inicio']) || empty($pausa['hora_fin'])) {
                    continue;
                }

                $descripcion = isset($pausa['descripcion']) ? $pausa['descripcion'] : '';
                $orden = isset($pausa['orden']) ? (int) $pausa['orden'] : $index;

                $sqlPausa = "INSERT INTO " . MAIN_DB_PREFIX . "jornadas_pausas(";
                $sqlPausa .= "fk_jornada, hora_inicio, hora_fin, descripcion, orden";
                $sqlPausa .= ") VALUES(";
                $sqlPausa .= (int) $id . ",";
                $sqlPausa .= "'" . $this->db->escape($pausa['hora_inicio']) . "',";
                $sqlPausa .= "'" . $this->db->escape($pausa['hora_fin']) . "',";
                $sqlPausa .= ($descripcion ? "'" . $this->db->escape($descripcion) . "'" : "NULL") . ",";
                $sqlPausa .= $orden;
                $sqlPausa .= ")";

                $resPausa = $this->db->query($sqlPausa);
                if (!$resPausa) {
                    $this->error = "Error al insertar pausa: " . $this->db->lasterror();
                    $this->errors[] = $this->error;
                    $this->db->rollback();
                    return -3;
                }
            }
        }

        $this->db->commit();
        return 1;
    }

    /**
     * Eliminar una jornada laboral
     *
     * @param int $id ID de jornada
     * @return int    >0 si ok, <0 si error
     */
    public function delete($id)
    {
        $this->errors = array();
        $this->error = '';

        $res = $this->fetch($id);
        if ($res <= 0) {
            $this->errors[] = 'Jornada no encontrada';
            return -1;
        }

        $this->db->begin();

        // Breaks will be deleted automatically by CASCADE constraint
        $sql = "DELETE FROM " . MAIN_DB_PREFIX . "jornadas_laborales";
        $sql .= " WHERE rowid = " . ((int) $id);

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = "Error al eliminar jornada: " . $this->db->lasterror();
            $this->errors[] = $this->error;
            $this->db->rollback();
            return -2;
        }

        $this->db->commit();
        return 1;
    }

    /**
     * Devuelve listado de jornadas laborales
     *
     * @param int $user_id ID usuario (opcional)
     * @return array|int   Array de jornadas o <0 si error
     */
    public function getAllJornadas($user_id = 0)
    {
        $sql = "SELECT j.rowid, j.fk_user, j.tipo_jornada, j.tipo_turno,";
        $sql .= " j.hora_inicio_jornada, j.hora_fin_jornada, j.observaciones, j.fecha_creacion, j.active";
        $sql .= " FROM " . MAIN_DB_PREFIX . "jornadas_laborales as j";
        $sql .= " WHERE j.active = 1";
        if ($user_id > 0) {
            $sql .= " AND j.fk_user = " . ((int) $user_id);
        }
        $sql .= " ORDER BY j.rowid DESC";

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = $this->db->lasterror();
            return -1;
        }

        $ret = array();
        while ($obj = $this->db->fetch_object($resql)) {
            $jornada = array(
                'id' => $obj->rowid,
                'fk_user' => $obj->fk_user,
                'tipo_jornada' => $obj->tipo_jornada,
                'tipo_turno' => $obj->tipo_turno,
                'hora_inicio_jornada' => $obj->hora_inicio_jornada,
                'hora_fin_jornada' => $obj->hora_fin_jornada,
                'observaciones' => $obj->observaciones,
                'fecha_creacion' => $obj->fecha_creacion,
                'active' => $obj->active,
                'pausas' => array()
            );

            // Fetch breaks for this shift
            $sqlPausas = "SELECT rowid, hora_inicio, hora_fin, descripcion, orden";
            $sqlPausas .= " FROM " . MAIN_DB_PREFIX . "jornadas_pausas";
            $sqlPausas .= " WHERE fk_jornada = " . ((int) $obj->rowid);
            $sqlPausas .= " ORDER BY orden ASC, hora_inicio ASC";

            $resPausas = $this->db->query($sqlPausas);
            if ($resPausas) {
                while ($objPausa = $this->db->fetch_object($resPausas)) {
                    $jornada['pausas'][] = array(
                        'id' => $objPausa->rowid,
                        'hora_inicio' => $objPausa->hora_inicio,
                        'hora_fin' => $objPausa->hora_fin,
                        'descripcion' => $objPausa->descripcion,
                        'orden' => $objPausa->orden
                    );
                }
                $this->db->free($resPausas);
            }

            $ret[] = $jornada;
        }
        $this->db->free($resql);

        return $ret;
    }
}
