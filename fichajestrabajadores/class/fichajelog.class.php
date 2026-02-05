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
 *  \file       htdocs/custom/fichajestrabajadores/class/fichajelog.class.php
 *  \ingroup    fichajestrabajadores
 *  \brief      Clase para gestionar el registro de auditoría de modificaciones
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';
require_once DOL_DOCUMENT_ROOT . '/user/class/user.class.php';

/**
 * Clase para gestionar el registro de auditoría de modificaciones
 */
class FichajeLog
{
    /**
     * @var DoliDB Database handler
     */
    public $db;

    /**
     * @var string Error code (or message)
     */
    public $error;

    /**
     * @var array Errors
     */
    public $errors = array();

    /**
     * @var int ID del log
     */
    public $id_log;

    /**
     * @var int ID del fichaje modificado (opcional)
     */
    public $id_fichaje;

    /**
     * @var int ID de la jornada modificada (opcional)
     */
    public $id_jornada;

    /**
     * @var int ID del usuario editor
     */
    public $usuario_editor;

    /**
     * @var string Fecha de modificación
     */
    public $fecha_modificacion;

    /**
     * @var string Campo modificado
     */
    public $campo_modificado;

    /**
     * @var string Valor anterior
     */
    public $valor_anterior;

    /**
     * @var string Valor nuevo
     */
    public $valor_nuevo;

    /**
     * @var string Comentario obligatorio
     */
    public $comentario;

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
     * Crea un registro de auditoría en la base de datos
     *
     * @param array $data Datos del log
     * @return int <0 si error, >0 si ok
     */
    public function create($data = array())
    {
        global $conf, $user;

        $error = 0;

        dol_syslog("FichajeLog::create - Iniciando creación de log de auditoría", LOG_DEBUG);

        // Limpieza de parámetros
        $this->id_fichaje = isset($data['id_fichaje']) ? (int) $data['id_fichaje'] : null;
        $this->id_jornada = isset($data['id_jornada']) ? (int) $data['id_jornada'] : null;
        $this->usuario_editor = isset($data['usuario_editor']) ? (int) $data['usuario_editor'] : $user->id;
        $this->campo_modificado = isset($data['campo_modificado']) ? $data['campo_modificado'] : '';
        $this->valor_anterior = isset($data['valor_anterior']) ? $data['valor_anterior'] : '';
        $this->valor_nuevo = isset($data['valor_nuevo']) ? $data['valor_nuevo'] : '';
        $this->comentario = isset($data['comentario']) ? $data['comentario'] : '';

        // Validación básica
        if (empty($this->usuario_editor)) {
            $this->errors[] = 'Usuario editor no especificado';
            return -1;
        }

        if (empty($this->id_fichaje) && empty($this->id_jornada)) {
            $this->errors[] = 'Debe especificar el ID del fichaje o de la jornada';
            return -2;
        }

        if (empty($this->campo_modificado)) {
            $this->errors[] = 'Campo modificado no especificado';
            return -3;
        }

        if (empty($this->comentario)) {
            $this->errors[] = 'Comentario obligatorio no especificado';
            return -4;
        }

        $this->db->begin();

        // Preparar consulta SQL
        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "fichajes_log (";
        $sql .= " id_fichaje,";
        $sql .= " id_jornada,";
        $sql .= " usuario_editor,";
        $sql .= " campo_modificado,";
        $sql .= " valor_anterior,";
        $sql .= " valor_nuevo,";
        $sql .= " comentario";
        $sql .= ") VALUES (";
        $sql .= " " . ($this->id_fichaje ? $this->id_fichaje : "NULL") . ",";
        $sql .= " " . ($this->id_jornada ? $this->id_jornada : "NULL") . ",";
        $sql .= " " . $this->usuario_editor . ",";
        $sql .= " '" . $this->db->escape($this->campo_modificado) . "',";
        $sql .= " " . ($this->valor_anterior ? "'" . $this->db->escape($this->valor_anterior) . "'" : "NULL") . ",";
        $sql .= " " . ($this->valor_nuevo ? "'" . $this->db->escape($this->valor_nuevo) . "'" : "NULL") . ",";
        $sql .= " '" . $this->db->escape($this->comentario) . "'";
        $sql .= ")";

        dol_syslog("FichajeLog::create - SQL: " . $sql, LOG_DEBUG);

        $resql = $this->db->query($sql);
        if (!$resql) {
            $error++;
            $this->errors[] = "Error al insertar registro: " . $this->db->lasterror();
        }

        if (!$error) {
            $this->id_log = $this->db->last_insert_id(MAIN_DB_PREFIX . "fichajes_log");
            $this->db->commit();
            return $this->id_log;
        } else {
            $this->db->rollback();
            return -1 * $error;
        }
    }

    /**
     * Carga un registro de auditoría desde la base de datos
     *
     * @param int $id ID del log a cargar
     * @return int <0 si error, >0 si ok
     */
    public function fetch($id)
    {
        $sql = "SELECT * FROM " . MAIN_DB_PREFIX . "fichajes_log WHERE id_log = " . (int) $id;
        
        dol_syslog("FichajeLog::fetch - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if ($resql) {
            if ($this->db->num_rows($resql)) {
                $obj = $this->db->fetch_object($resql);
                
                $this->id_log = $obj->id_log;
                $this->id_fichaje = $obj->id_fichaje;
                $this->id_jornada = $obj->id_jornada;
                $this->usuario_editor = $obj->usuario_editor;
                $this->fecha_modificacion = $this->db->jdate($obj->fecha_modificacion, true);
                $this->campo_modificado = $obj->campo_modificado;
                $this->valor_anterior = $obj->valor_anterior;
                $this->valor_nuevo = $obj->valor_nuevo;
                $this->comentario = $obj->comentario;
                
                $this->db->free($resql);
                return 1;
            }
            $this->db->free($resql);
            return 0;
        } else {
            $this->error = "Error al leer datos: " . $this->db->lasterror();
            return -1;
        }
    }

    /**
     * Obtiene todos los registros de auditoría para un fichaje o jornada
     *
     * @param int $id_fichaje ID del fichaje (opcional)
     * @param int $id_jornada ID de la jornada (opcional)
     * @return array|int Lista de logs o <0 si error
     */
    public function getAllLogs($id_fichaje = 0, $id_jornada = 0)
    {
        $logs = array();
        
        $sql = "SELECT l.*, u.firstname, u.lastname, u.login";
        $sql .= " FROM " . MAIN_DB_PREFIX . "fichajes_log as l";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as u ON l.usuario_editor = u.rowid";
        $sql .= " WHERE 1=1";
        
        if ($id_fichaje > 0) {
            $sql .= " AND l.id_fichaje = " . (int) $id_fichaje;
        }
        
        if ($id_jornada > 0) {
            $sql .= " AND l.id_jornada = " . (int) $id_jornada;
        }
        
        $sql .= " ORDER BY l.fecha_modificacion DESC";
        
        dol_syslog("FichajeLog::getAllLogs - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if ($resql) {
            while ($obj = $this->db->fetch_object($resql)) {
                $log = new FichajeLog($this->db);
                
                $log->id_log = $obj->id_log;
                $log->id_fichaje = $obj->id_fichaje;
                $log->id_jornada = $obj->id_jornada;
                $log->usuario_editor = $obj->usuario_editor;
                $log->fecha_modificacion = $this->db->jdate($obj->fecha_modificacion, true);
                $log->campo_modificado = $obj->campo_modificado;
                $log->valor_anterior = $obj->valor_anterior;
                $log->valor_nuevo = $obj->valor_nuevo;
                $log->comentario = $obj->comentario;
                
                // Datos del usuario
                $log->usuario_nombre = trim($obj->firstname . ' ' . $obj->lastname) . ' (' . $obj->login . ')';
                
                $logs[] = $log;
            }
            
            $this->db->free($resql);
            return $logs;
        } else {
            $this->error = "Error al leer datos: " . $this->db->lasterror();
            return -1;
        }
    }
} 