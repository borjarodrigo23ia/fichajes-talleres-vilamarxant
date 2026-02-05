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
 *  \file       htdocs/custom/fichajestrabajadores/class/jornadacompleta.class.php
 *  \ingroup    fichajestrabajadores
 *  \brief      Clase para gestionar jornadas completas de trabajadores
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';
require_once DOL_DOCUMENT_ROOT . '/user/class/user.class.php';

/**
 * Clase para gestionar jornadas completas de trabajadores
 */
class JornadaCompleta
{
    /** @var DoliDB */
    public $db;

    /** @var string */
    public $error;

    /** @var array */
    public $errors = array();

    /** @var int ID de jornada */
    public $id_jornada;

    /** @var int ID del usuario */
    public $usuario_id;

    /** @var int Timestamp de la fecha de la jornada */
    public $fecha;

    /** @var string Hora de entrada (YYYY-MM-DD HH:MM:SS) */
    public $hora_entrada;

    /** @var string Hora de salida (YYYY-MM-DD HH:MM:SS) */
    public $hora_salida;

    /** @var string Tiempo total en pausa (HH:MM:SS) */
    public $total_pausa;

    /** @var string Tiempo total trabajado (HH:MM:SS) */
    public $total_trabajo;

    /** @var string Observaciones */
    public $observaciones;

    /** @var int Timestamp fecha de creación */
    public $fecha_creacion;

    /** @var int Estado activo */
    public $active;

    /** @var int ID del usuario que hizo la última modificación */
    public $ultimo_editor;

    /** @var string Nombre del usuario que hizo la última modificación */
    public $editor_nombre;

    /** @var int Timestamp de la última modificación */
    public $ultima_modificacion;

    /** @var string Nombre del usuario (para vistas) */
    public $usuario_nombre;

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
     * Crear una jornada completa
     *
     * @param int   $usuario_id ID de usuario
     * @param array $data       Datos de la jornada
     * @return int              ID de jornada (>0) o <0 si error
     */
    public function create($usuario_id, $data = array())
    {
        global $user;

        $this->errors = array();
        $this->error = '';

        $this->usuario_id = (int) $usuario_id;
        $this->fecha = isset($data['fecha']) ? (int) $data['fecha'] : dol_now();
        $this->hora_entrada = isset($data['hora_entrada']) ? $data['hora_entrada'] : null;
        $this->hora_salida = isset($data['hora_salida']) ? $data['hora_salida'] : null;
        $this->total_pausa = isset($data['total_pausa']) ? $data['total_pausa'] : '00:00:00';
        $this->total_trabajo = isset($data['total_trabajo']) ? $data['total_trabajo'] : null;
        $this->observaciones = isset($data['observaciones']) ? $data['observaciones'] : null;
        $this->active = 1;

        if (empty($this->usuario_id)) {
            $this->errors[] = 'Usuario no especificado';
            return -1;
        }
        if (empty($this->hora_entrada) || empty($this->hora_salida) || empty($this->total_trabajo)) {
            $this->errors[] = 'Faltan datos obligatorios para la jornada';
            return -2;
        }

        $this->db->begin();

        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "jornadas_completas(";
        $sql .= "usuario_id, fecha, hora_entrada, hora_salida, total_pausa, total_trabajo, observaciones, active";
        $sql .= ") VALUES(";
        $sql .= (int) $this->usuario_id . ",";
        $sql .= "'" . $this->db->idate($this->fecha) . "',";
        $sql .= "'" . $this->db->escape($this->hora_entrada) . "',";
        $sql .= "'" . $this->db->escape($this->hora_salida) . "',";
        $sql .= "'" . $this->db->escape($this->total_pausa) . "',";
        $sql .= "'" . $this->db->escape($this->total_trabajo) . "',";
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

        $this->id_jornada = $this->db->last_insert_id(MAIN_DB_PREFIX . "jornadas_completas");
        $this->db->commit();

        return $this->id_jornada;
    }

    /**
     * Cargar una jornada completa
     *
     * @param int $id ID de jornada
     * @return int    1 si ok, 0 si no encontrada, <0 si error
     */
    public function fetch($id)
    {
        $sql = "SELECT j.*, u.firstname, u.lastname, u.login,";
        $sql .= " e.firstname as editor_firstname, e.lastname as editor_lastname, e.login as editor_login";
        $sql .= " FROM " . MAIN_DB_PREFIX . "jornadas_completas as j";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as u ON j.usuario_id = u.rowid";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as e ON j.ultimo_editor = e.rowid";
        $sql .= " WHERE j.id_jornada = " . ((int) $id);

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

        $this->id_jornada = $obj->id_jornada;
        $this->usuario_id = $obj->usuario_id;
        $this->fecha = $this->db->jdate($obj->fecha);
        $this->hora_entrada = $obj->hora_entrada;
        $this->hora_salida = $obj->hora_salida;
        $this->total_pausa = $obj->total_pausa;
        $this->total_trabajo = $obj->total_trabajo;
        $this->observaciones = $obj->observaciones;
        $this->fecha_creacion = $this->db->jdate($obj->fecha_creacion);
        $this->active = $obj->active;

        $this->usuario_nombre = trim($obj->firstname . ' ' . $obj->lastname) . ' (' . $obj->login . ')';

        $this->ultimo_editor = $obj->ultimo_editor;
        $this->ultima_modificacion = $obj->ultima_modificacion ? $this->db->jdate($obj->ultima_modificacion, true) : null;
        if (!empty($obj->editor_firstname) || !empty($obj->editor_lastname)) {
            $this->editor_nombre = trim($obj->editor_firstname . ' ' . $obj->editor_lastname) . ' (' . $obj->editor_login . ')';
        }

        $this->db->free($resql);

        return 1;
    }

    /**
     * Actualizar una jornada completa
     *
     * @param int    $id          ID de jornada
     * @param array  $data        Datos a actualizar
     * @param string $comentario  Comentario obligatorio para auditoría
     * @return int                >0 si ok, <0 si error
     */
    public function update($id, $data = array(), $comentario = '')
    {
        global $user, $conf;

        $this->errors = array();
        $this->error = '';

        if (empty($comentario)) {
            $this->errors[] = 'El comentario es obligatorio para la auditoría';
            return -1;
        }

        $res = $this->fetch($id);
        if ($res <= 0) {
            $this->errors[] = 'Jornada no encontrada';
            return -2;
        }

        $this->db->begin();

        // Calcular siguiente revisión
        $rev = 1;
        $sqlrev = "SELECT IFNULL(MAX(revision),0)+1 as rev FROM " . MAIN_DB_PREFIX . "fichajes_originales_modificados";
        $sqlrev .= " WHERE id_jornada = " . ((int) $id) . " AND entity = " . ((int) $conf->entity);
        $resrev = $this->db->query($sqlrev);
        if ($resrev) {
            $objrev = $this->db->fetch_object($resrev);
            if ($objrev) {
                $rev = (int) $objrev->rev;
            }
            $this->db->free($resrev);
        }

        // Insertar snapshot original
        $sqlsnap = "INSERT INTO " . MAIN_DB_PREFIX . "fichajes_originales_modificados(";
        $sqlsnap .= "id_jornada, usuario_id, fecha, hora_entrada, hora_salida, total_pausa, total_trabajo, observaciones,";
        $sqlsnap .= "fecha_creacion, tms, active, ultimo_editor, ultima_modificacion, modificado_por, comentario_modificacion, modificado_en, revision, entity";
        $sqlsnap .= ") VALUES(";
        $sqlsnap .= (int) $this->id_jornada . ",";
        $sqlsnap .= (int) $this->usuario_id . ",";
        $sqlsnap .= ($this->fecha ? "'" . $this->db->idate($this->fecha) . "'" : "NULL") . ",";
        $sqlsnap .= "'" . $this->db->escape($this->hora_entrada) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->hora_salida) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->total_pausa) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->total_trabajo) . "',";
        $sqlsnap .= ($this->observaciones ? "'" . $this->db->escape($this->observaciones) . "'" : "NULL") . ",";
        $sqlsnap .= ($this->fecha_creacion ? "'" . $this->db->idate($this->fecha_creacion) . "'" : "NULL") . ",";
        $sqlsnap .= "NULL,"; // tms
        $sqlsnap .= (int) ($this->active ? $this->active : 1) . ",";
        $sqlsnap .= ($this->ultimo_editor ? (int) $this->ultimo_editor : "NULL") . ",";
        $sqlsnap .= ($this->ultima_modificacion ? "'" . $this->db->idate($this->ultima_modificacion) . "'" : "NULL") . ",";
        $sqlsnap .= (int) $user->id . ",";
        $sqlsnap .= "'" . $this->db->escape($comentario) . "',";
        $sqlsnap .= "'" . $this->db->idate(dol_now()) . "',";
        $sqlsnap .= (int) $rev . ",";
        $sqlsnap .= (int) $conf->entity;
        $sqlsnap .= ")";

        dol_syslog(__METHOD__ . " - snapshot SQL: " . $sqlsnap, LOG_DEBUG);

        $ressnap = $this->db->query($sqlsnap);
        if (!$ressnap) {
            $this->error = "Error al insertar snapshot original: " . $this->db->lasterror();
            $this->errors[] = $this->error;
            $this->db->rollback();
            return -3;
        }

        // Construir UPDATE
        $update = array();

        if (isset($data['usuario_id'])) {
            $update[] = "usuario_id = " . ((int) $data['usuario_id']);
        }
        if (isset($data['fecha'])) {
            $update[] = "fecha = '" . $this->db->idate($data['fecha']) . "'";
        }
        if (isset($data['hora_entrada'])) {
            $update[] = "hora_entrada = '" . $this->db->escape($data['hora_entrada']) . "'";
        }
        if (isset($data['hora_salida'])) {
            $update[] = "hora_salida = '" . $this->db->escape($data['hora_salida']) . "'";
        }
        if (isset($data['total_pausa'])) {
            $update[] = "total_pausa = '" . $this->db->escape($data['total_pausa']) . "'";
        }
        if (isset($data['total_trabajo'])) {
            $update[] = "total_trabajo = '" . $this->db->escape($data['total_trabajo']) . "'";
        }
        if (array_key_exists('observaciones', $data)) {
            $update[] = "observaciones = " . ($data['observaciones'] !== null && $data['observaciones'] !== '' ? "'" . $this->db->escape($data['observaciones']) . "'" : "NULL");
        }

        // Campos de auditoría
        $now = dol_now();
        $update[] = "ultimo_editor = " . ((int) $user->id);
        $update[] = "ultima_modificacion = '" . $this->db->idate($now) . "'";

        if (empty($update)) {
            $this->db->rollback();
            return 0;
        }

        $sql = "UPDATE " . MAIN_DB_PREFIX . "jornadas_completas SET ";
        $sql .= implode(', ', $update);
        $sql .= " WHERE id_jornada = " . ((int) $id);

        dol_syslog(__METHOD__ . " - update SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = "Error al actualizar jornada: " . $this->db->lasterror();
            $this->errors[] = $this->error;
            $this->db->rollback();
            return -4;
        }

        $this->db->commit();
        return 1;
    }

    /**
     * Eliminar (soft delete) una jornada completa
     *
     * @param int $id ID de jornada
     * @return int    >0 si ok, <0 si error
     */
    public function delete($id)
    {
        global $user, $conf;

        $this->errors = array();
        $this->error = '';

        $res = $this->fetch($id);
        if ($res <= 0) {
            $this->errors[] = 'Jornada no encontrada';
            return -1;
        }

        $this->db->begin();

        // Calcular siguiente revisión para el snapshot de eliminación
        $rev = 1;
        $sqlrev = "SELECT IFNULL(MAX(revision),0)+1 as rev FROM " . MAIN_DB_PREFIX . "fichajes_originales_modificados";
        $sqlrev .= " WHERE id_jornada = " . ((int) $id) . " AND entity = " . ((int) $conf->entity);
        $resrev = $this->db->query($sqlrev);
        if ($resrev) {
            $objrev = $this->db->fetch_object($resrev);
            if ($objrev) {
                $rev = (int) $objrev->rev;
            }
            $this->db->free($resrev);
        }

        // Insertar snapshot de la jornada antes de marcarla como eliminada
        $sqlsnap = "INSERT INTO " . MAIN_DB_PREFIX . "fichajes_originales_modificados(";
        $sqlsnap .= "id_jornada, usuario_id, fecha, hora_entrada, hora_salida, total_pausa, total_trabajo, observaciones,";
        $sqlsnap .= "fecha_creacion, tms, active, ultimo_editor, ultima_modificacion, modificado_por, comentario_modificacion, modificado_en, revision, entity";
        $sqlsnap .= ") VALUES(";
        $sqlsnap .= (int) $this->id_jornada . ",";
        $sqlsnap .= (int) $this->usuario_id . ",";
        $sqlsnap .= ($this->fecha ? "'" . $this->db->idate($this->fecha) . "'" : "NULL") . ",";
        $sqlsnap .= "'" . $this->db->escape($this->hora_entrada) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->hora_salida) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->total_pausa) . "',";
        $sqlsnap .= "'" . $this->db->escape($this->total_trabajo) . "',";
        $sqlsnap .= ($this->observaciones ? "'" . $this->db->escape($this->observaciones) . "'" : "NULL") . ",";
        $sqlsnap .= ($this->fecha_creacion ? "'" . $this->db->idate($this->fecha_creacion) . "'" : "NULL") . ",";
        $sqlsnap .= "NULL,"; // tms
        $sqlsnap .= (int) ($this->active ? $this->active : 1) . ",";
        $sqlsnap .= ($this->ultimo_editor ? (int) $this->ultimo_editor : "NULL") . ",";
        $sqlsnap .= ($this->ultima_modificacion ? "'" . $this->db->idate($this->ultima_modificacion) . "'" : "NULL") . ",";
        $sqlsnap .= (int) $user->id . ",";
        $sqlsnap .= "'" . $this->db->escape('Fichaje eliminado') . "',";
        $sqlsnap .= "'" . $this->db->idate(dol_now()) . "',";
        $sqlsnap .= (int) $rev . ",";
        $sqlsnap .= (int) $conf->entity;
        $sqlsnap .= ")";

        dol_syslog(__METHOD__ . " - delete snapshot SQL: " . $sqlsnap, LOG_DEBUG);

        $ressnap = $this->db->query($sqlsnap);
        if (!$ressnap) {
            $this->error = "Error al insertar snapshot de eliminación: " . $this->db->lasterror();
            $this->errors[] = $this->error;
            $this->db->rollback();
            return -2;
        }

        // Soft delete: marcar como inactive y actualizar auditoría
        $now = dol_now();
        $sql = "UPDATE " . MAIN_DB_PREFIX . "jornadas_completas SET";
        $sql .= " active = 0,";
        $sql .= " ultimo_editor = " . ((int) $user->id) . ",";
        $sql .= " ultima_modificacion = '" . $this->db->idate($now) . "'";
        $sql .= " WHERE id_jornada = " . ((int) $id);

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
     * Calcular jornadas completas a partir de fichajes de un día
     *
     * @param int    $usuario_id ID usuario
     * @param string $fecha      Fecha YYYY-MM-DD
     * @return int               ID de la última jornada creada o <0 si error
     */
    public function calcularJornadaCompleta($usuario_id, $fecha)
    {
        $this->errors = array();
        $this->error = '';

        $usuario_id = (int) $usuario_id;
        if (empty($usuario_id) || empty($fecha)) {
            $this->errors[] = 'Parámetros usuario_id y fecha requeridos';
            return -1;
        }

        $fecha_str = substr($fecha, 0, 10);

        $sql = "SELECT rowid, tipo, fecha_creacion, observaciones";
        $sql .= " FROM " . MAIN_DB_PREFIX . "fichajestrabajadores";
        $sql .= " WHERE fk_user = " . $usuario_id;
        $sql .= " AND fecha_creacion >= '" . $this->db->escape($fecha_str . " 00:00:00") . "'";
        $sql .= " AND fecha_creacion <= '" . $this->db->escape($fecha_str . " 23:59:59") . "'";
        $sql .= " ORDER BY fecha_creacion ASC";

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = "Error al leer fichajes: " . $this->db->lasterror();
            return -2;
        }

        $fichajes = array();
        while ($obj = $this->db->fetch_object($resql)) {
            $fichajes[] = array(
                'id' => $obj->rowid,
                'tipo' => $obj->tipo,
                'fecha_creacion' => $this->db->jdate($obj->fecha_creacion),
                'observaciones' => $obj->observaciones
            );
        }
        $this->db->free($resql);

        if (empty($fichajes)) {
            $this->errors[] = 'No hay fichajes para esta fecha';
            return -3;
        }

        $ciclos = array();
        $ciclo_actual = null;

        foreach ($fichajes as $fichaje) {
            switch ($fichaje['tipo']) {
                case 'entrar':
                    $ciclo_actual = array(
                        'entrada' => $fichaje['fecha_creacion'],
                        'salida' => null,
                        'pausas' => array()
                    );
                    break;
                case 'salir':
                    if ($ciclo_actual !== null && $ciclo_actual['entrada'] !== null) {
                        $ciclo_actual['salida'] = $fichaje['fecha_creacion'];
                        $ciclos[] = $ciclo_actual;
                        $ciclo_actual = null;
                    }
                    break;
                case 'pausa':
                    if ($ciclo_actual !== null && $ciclo_actual['entrada'] !== null) {
                        $ciclo_actual['pausas'][] = array(
                            'inicio' => $fichaje['fecha_creacion'],
                            'fin' => null
                        );
                    }
                    break;
                case 'finp':
                    if ($ciclo_actual !== null && $ciclo_actual['entrada'] !== null && !empty($ciclo_actual['pausas'])) {
                        for ($i = count($ciclo_actual['pausas']) - 1; $i >= 0; $i--) {
                            if ($ciclo_actual['pausas'][$i]['fin'] === null) {
                                $ciclo_actual['pausas'][$i]['fin'] = $fichaje['fecha_creacion'];
                                break;
                            }
                        }
                    }
                    break;
            }
        }

        $jornadas_creadas = array();

        foreach ($ciclos as $ciclo) {
            if ($ciclo['entrada'] === null || $ciclo['salida'] === null) {
                continue;
            }

            $total_pausa_segundos = 0;
            foreach ($ciclo['pausas'] as $pausa) {
                if ($pausa['inicio'] !== null && $pausa['fin'] !== null) {
                    $tiempo_pausa = $pausa['fin'] - $pausa['inicio'];
                    $total_pausa_segundos += $tiempo_pausa;
                }
            }

            $tiempo_total = $ciclo['salida'] - $ciclo['entrada'];
            $total_trabajo_segundos = max(0, $tiempo_total - $total_pausa_segundos);

            $horas_pausa = floor($total_pausa_segundos / 3600);
            $minutos_pausa = floor(($total_pausa_segundos % 3600) / 60);
            $segundos_pausa = $total_pausa_segundos % 60;
            $total_pausa = sprintf('%02d:%02d:%02d', $horas_pausa, $minutos_pausa, $segundos_pausa);

            $horas_trabajo = floor($total_trabajo_segundos / 3600);
            $minutos_trabajo = floor(($total_trabajo_segundos % 3600) / 60);
            $segundos_trabajo = $total_trabajo_segundos % 60;
            $total_trabajo = sprintf('%02d:%02d:%02d', $horas_trabajo, $minutos_trabajo, $segundos_trabajo);

            $fecha_ts = dol_mktime(0, 0, 0, (int) substr($fecha_str, 5, 2), (int) substr($fecha_str, 8, 2), (int) substr($fecha_str, 0, 4));

            $data = array(
                'fecha' => $fecha_ts,
                'hora_entrada' => dol_print_date($ciclo['entrada'], '%Y-%m-%d %H:%M:%S'),
                'hora_salida' => dol_print_date($ciclo['salida'], '%Y-%m-%d %H:%M:%S'),
                'total_pausa' => $total_pausa,
                'total_trabajo' => $total_trabajo,
                'observaciones' => 'Jornada calculada automáticamente'
            );

            $rescreate = $this->create($usuario_id, $data);
            if ($rescreate < 0) {
                $this->error = 'Error al crear jornada';
                return -4;
            }
            $jornadas_creadas[] = $rescreate;
        }

        if (empty($jornadas_creadas)) {
            return -5;
        }

        return end($jornadas_creadas);
    }

    /**
     * Devuelve listado de jornadas completas
     *
     * @param int    $usuario_id   ID usuario (opcional)
     * @param string $fecha_inicio Fecha inicio filtro (YYYY-MM-DD)
     * @param string $fecha_fin    Fecha fin filtro (YYYY-MM-DD)
     * @return array|int           Array de jornadas o <0 si error
     */
    public function getAllJornadas($usuario_id = 0, $fecha_inicio = '', $fecha_fin = '')
    {
        $sql = "SELECT j.id_jornada, j.usuario_id, j.fecha, j.hora_entrada, j.hora_salida, j.total_pausa, j.total_trabajo, j.observaciones,";
        $sql .= " u.firstname, u.lastname, u.login";
        $sql .= " FROM " . MAIN_DB_PREFIX . "jornadas_completas as j";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as u ON j.usuario_id = u.rowid";
        $sql .= " WHERE j.active = 1";
        if ($usuario_id > 0) {
            $sql .= " AND j.usuario_id = " . ((int) $usuario_id);
        }

        if ($fecha_inicio) {
            $sql .= " AND j.fecha >= '" . $this->db->idate(dol_mktime(0, 0, 0, (int) substr($fecha_inicio, 5, 2), (int) substr($fecha_inicio, 8, 2), (int) substr($fecha_inicio, 0, 4))) . "'";
        }
        if ($fecha_fin) {
            $sql .= " AND j.fecha <= '" . $this->db->idate(dol_mktime(23, 59, 59, (int) substr($fecha_fin, 5, 2), (int) substr($fecha_fin, 8, 2), (int) substr($fecha_fin, 0, 4))) . "'";
        }

        $sql .= " ORDER BY j.fecha DESC, j.hora_entrada DESC";

        dol_syslog(__METHOD__ . " - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $this->error = $this->db->lasterror();
            return -1;
        }

        $ret = array();
        while ($obj = $this->db->fetch_object($resql)) {
            $usuario_nombre = trim($obj->firstname . ' ' . $obj->lastname);
            if (empty($usuario_nombre)) {
                $usuario_nombre = $obj->login;
            }

            $ret[] = array(
                'id_jornada' => $obj->id_jornada,
                'usuario_id' => $obj->usuario_id,
                'usuario_nombre' => $usuario_nombre,
                'fecha' => $this->db->jdate($obj->fecha),
                'hora_entrada' => $obj->hora_entrada,
                'hora_salida' => $obj->hora_salida,
                'total_pausa' => $obj->total_pausa,
                'total_trabajo' => $obj->total_trabajo,
                'observaciones' => $obj->observaciones
            );
        }
        $this->db->free($resql);

        return $ret;
    }
}
