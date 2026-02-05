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
 *  \brief      Clase para gestionar jornadas laborales de trabajadores
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';

/**
 * Clase para gestionar jornadas laborales de trabajadores
 */
class JornadaLaboral
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
     * @var string ID
     */
    public $id;

    /**
     * @var int ID del usuario/trabajador
     */
    public $fk_user;

    /**
     * @var string Tipo de jornada (intensiva/partida)
     */
    public $tipo_jornada;

    /**
     * @var string Tipo de turno (fijo/rotativo)
     */
    public $tipo_turno;

    /**
     * @var string Hora de inicio de jornada
     */
    public $hora_inicio_jornada;

    /**
     * @var string Hora de inicio de pausa
     */
    public $hora_inicio_pausa;

    /**
     * @var string Hora de fin de pausa
     */
    public $hora_fin_pausa;

    /**
     * @var string Hora de fin de jornada
     */
    public $hora_fin_jornada;

    /**
     * @var string Observaciones
     */
    public $observaciones;

    /**
     * @var int Fecha de creación
     */
    public $fecha_creacion;

    /**
     * @var int Estado activo
     */
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
     * Crea un registro de jornada laboral en la base de datos
     *
     * @param int $user_id ID del usuario
     * @param array $data Datos de la jornada laboral
     * @return int <0 si error, >0 si ok
     */
    public function create($user_id, $data)
    {
        global $conf, $user;

        $error = 0;

        dol_syslog("JornadaLaboral::create - Iniciando creación de jornada laboral", LOG_DEBUG);

        // Limpiar los errores previos
        $this->errors = array();
        
        // Validar datos requeridos
        if (empty($user_id)) {
            $this->errors[] = 'ID de usuario requerido';
            return -1;
        }

        if (empty($data['tipo_jornada']) || 
            empty($data['tipo_turno']) || 
            empty($data['hora_inicio_jornada']) || 
            empty($data['hora_fin_jornada'])) {
            $this->errors[] = 'Faltan campos obligatorios';
            return -1;
        }

        // Validar tipo de jornada
        $tipos_jornada = array('intensiva', 'partida');
        if (!in_array($data['tipo_jornada'], $tipos_jornada)) {
            $this->errors[] = 'Tipo de jornada no válido: ' . $data['tipo_jornada'];
            return -1;
        }

        // Validar tipo de turno
        $tipos_turno = array('fijo', 'rotativo');
        if (!in_array($data['tipo_turno'], $tipos_turno)) {
            $this->errors[] = 'Tipo de turno no válido: ' . $data['tipo_turno'];
            return -1;
        }

        // Preparar datos
        $this->fk_user = $user_id;
        $this->tipo_jornada = $data['tipo_jornada'];
        $this->tipo_turno = $data['tipo_turno'];
        $this->hora_inicio_jornada = $data['hora_inicio_jornada'];
        $this->hora_inicio_pausa = $data['hora_inicio_pausa'];
        $this->hora_fin_pausa = $data['hora_fin_pausa'];
        $this->hora_fin_jornada = $data['hora_fin_jornada'];
        $this->observaciones = $data['observaciones'];
        $this->active = 1;

        // Preparar la consulta SQL
        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "jornadas_laborales (";
        $sql .= " fk_user,";
        $sql .= " tipo_jornada,";
        $sql .= " tipo_turno,";
        $sql .= " hora_inicio_jornada,";
        $sql .= " hora_fin_jornada";
        
        if (!empty($this->hora_inicio_pausa)) {
            $sql .= ", hora_inicio_pausa";
        }
        
        if (!empty($this->hora_fin_pausa)) {
            $sql .= ", hora_fin_pausa";
        }
        
        if (!empty($this->observaciones)) {
            $sql .= ", observaciones";
        }
        
        $sql .= ", active";
        $sql .= ") VALUES (";
        $sql .= " " . $this->fk_user . ",";
        $sql .= " '" . $this->db->escape($this->tipo_jornada) . "',";
        $sql .= " '" . $this->db->escape($this->tipo_turno) . "',";
        $sql .= " '" . $this->db->escape($this->hora_inicio_jornada) . "',";
        $sql .= " '" . $this->db->escape($this->hora_fin_jornada) . "'";
        
        if (!empty($this->hora_inicio_pausa)) {
            $sql .= ", '" . $this->db->escape($this->hora_inicio_pausa) . "'";
        }
        
        if (!empty($this->hora_fin_pausa)) {
            $sql .= ", '" . $this->db->escape($this->hora_fin_pausa) . "'";
        }
        
        if (!empty($this->observaciones)) {
            $sql .= ", '" . $this->db->escape($this->observaciones) . "'";
        }
        
        $sql .= ", " . $this->active;
        $sql .= ")";

        $this->db->begin();
        
        dol_syslog("JornadaLaboral::create - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if (!$resql) {
            $error++;
            $this->errors[] = "Error al insertar en la base de datos: " . $this->db->lasterror();
            dol_syslog("JornadaLaboral::create - Error: " . $this->db->lasterror(), LOG_ERR);
        }
        
        if (!$error) {
            $this->id = $this->db->last_insert_id(MAIN_DB_PREFIX . "jornadas_laborales");
            
            $this->db->commit();
            return $this->id;
        } else {
            $this->db->rollback();
            return -1 * $error;
        }
    }

    /**
     * Actualiza un registro de jornada laboral en la base de datos
     *
     * @param int $id ID de la jornada a actualizar
     * @param array $data Datos de la jornada laboral
     * @return int <0 si error, >0 si ok
     */
    public function update($id, $data)
    {
        global $conf, $user;

        $error = 0;

        dol_syslog("JornadaLaboral::update - Iniciando actualización de jornada laboral ID: " . $id, LOG_DEBUG);

        // Limpiar los errores previos
        $this->errors = array();
        
        // Validar ID
        if (empty($id)) {
            $this->errors[] = 'ID de jornada requerido';
            return -1;
        }

        // Preparar la consulta SQL
        $sql = "UPDATE " . MAIN_DB_PREFIX . "jornadas_laborales SET";
        
        $update_fields = array();
        
        if (isset($data['fk_user']) && !empty($data['fk_user'])) {
            $update_fields[] = " fk_user = " . (int)$data['fk_user'];
        }
        
        if (isset($data['tipo_jornada']) && !empty($data['tipo_jornada'])) {
            // Validar tipo de jornada
            $tipos_jornada = array('intensiva', 'partida');
            if (!in_array($data['tipo_jornada'], $tipos_jornada)) {
                $this->errors[] = 'Tipo de jornada no válido: ' . $data['tipo_jornada'];
                return -1;
            }
            $update_fields[] = " tipo_jornada = '" . $this->db->escape($data['tipo_jornada']) . "'";
        }
        
        if (isset($data['tipo_turno']) && !empty($data['tipo_turno'])) {
            // Validar tipo de turno
            $tipos_turno = array('fijo', 'rotativo');
            if (!in_array($data['tipo_turno'], $tipos_turno)) {
                $this->errors[] = 'Tipo de turno no válido: ' . $data['tipo_turno'];
                return -1;
            }
            $update_fields[] = " tipo_turno = '" . $this->db->escape($data['tipo_turno']) . "'";
        }
        
        if (isset($data['hora_inicio_jornada']) && !empty($data['hora_inicio_jornada'])) {
            $update_fields[] = " hora_inicio_jornada = '" . $this->db->escape($data['hora_inicio_jornada']) . "'";
        }
        
        if (isset($data['hora_inicio_pausa'])) {
            if (empty($data['hora_inicio_pausa'])) {
                $update_fields[] = " hora_inicio_pausa = NULL";
            } else {
                $update_fields[] = " hora_inicio_pausa = '" . $this->db->escape($data['hora_inicio_pausa']) . "'";
            }
        }
        
        if (isset($data['hora_fin_pausa'])) {
            if (empty($data['hora_fin_pausa'])) {
                $update_fields[] = " hora_fin_pausa = NULL";
            } else {
                $update_fields[] = " hora_fin_pausa = '" . $this->db->escape($data['hora_fin_pausa']) . "'";
            }
        }
        
        if (isset($data['hora_fin_jornada']) && !empty($data['hora_fin_jornada'])) {
            $update_fields[] = " hora_fin_jornada = '" . $this->db->escape($data['hora_fin_jornada']) . "'";
        }
        
        if (isset($data['observaciones'])) {
            $update_fields[] = " observaciones = '" . $this->db->escape($data['observaciones']) . "'";
        }
        
        if (isset($data['active'])) {
            $update_fields[] = " active = " . (int)$data['active'];
        }
        
        // Si no hay campos para actualizar, retornar error
        if (empty($update_fields)) {
            $this->errors[] = 'No hay campos para actualizar';
            return -1;
        }
        
        $sql .= implode(',', $update_fields);
        $sql .= " WHERE rowid = " . (int)$id;

        $this->db->begin();
        
        dol_syslog("JornadaLaboral::update - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if (!$resql) {
            $error++;
            $this->errors[] = "Error al actualizar en la base de datos: " . $this->db->lasterror();
            dol_syslog("JornadaLaboral::update - Error: " . $this->db->lasterror(), LOG_ERR);
        }
        
        if (!$error) {
            $this->db->commit();
            return 1;
        } else {
            $this->db->rollback();
            return -1 * $error;
        }
    }

    /**
     * Elimina un registro de jornada laboral de la base de datos
     *
     * @param int $id ID de la jornada a eliminar
     * @return int <0 si error, >0 si ok
     */
    public function delete($id)
    {
        global $conf, $user;

        $error = 0;

        dol_syslog("JornadaLaboral::delete - Iniciando eliminación de jornada laboral ID: " . $id, LOG_DEBUG);

        // Limpiar los errores previos
        $this->errors = array();
        
        // Validar ID
        if (empty($id)) {
            $this->errors[] = 'ID de jornada requerido';
            return -1;
        }

        // Preparar la consulta SQL
        $sql = "DELETE FROM " . MAIN_DB_PREFIX . "jornadas_laborales";
        $sql .= " WHERE rowid = " . (int)$id;

        $this->db->begin();
        
        dol_syslog("JornadaLaboral::delete - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if (!$resql) {
            $error++;
            $this->errors[] = "Error al eliminar de la base de datos: " . $this->db->lasterror();
            dol_syslog("JornadaLaboral::delete - Error: " . $this->db->lasterror(), LOG_ERR);
        }
        
        if (!$error) {
            $this->db->commit();
            return 1;
        } else {
            $this->db->rollback();
            return -1 * $error;
        }
    }

    /**
     * Carga una jornada laboral desde la base de datos
     *
     * @param int $id ID de la jornada a cargar
     * @return int <0 si error, >0 si ok
     */
    public function fetch($id)
    {
        $sql = "SELECT * FROM " . MAIN_DB_PREFIX . "jornadas_laborales WHERE rowid = " . (int)$id;
        
        dol_syslog("JornadaLaboral::fetch - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if ($resql) {
            if ($this->db->num_rows($resql)) {
                $obj = $this->db->fetch_object($resql);
                
                $this->id = $obj->rowid;
                $this->fk_user = $obj->fk_user;
                $this->tipo_jornada = $obj->tipo_jornada;
                $this->tipo_turno = $obj->tipo_turno;
                $this->hora_inicio_jornada = $obj->hora_inicio_jornada;
                $this->hora_inicio_pausa = $obj->hora_inicio_pausa;
                $this->hora_fin_pausa = $obj->hora_fin_pausa;
                $this->hora_fin_jornada = $obj->hora_fin_jornada;
                $this->observaciones = $obj->observaciones;
                $this->fecha_creacion = $obj->fecha_creacion;
                $this->active = $obj->active;
                
                $this->db->free($resql);
                return 1;
            } else {
                $this->db->free($resql);
                $this->errors[] = 'Jornada laboral no encontrada';
                return 0;
            }
        } else {
            $this->errors[] = "Error al consultar la base de datos: " . $this->db->lasterror();
            dol_syslog("JornadaLaboral::fetch - Error: " . $this->db->lasterror(), LOG_ERR);
            return -1;
        }
    }

    /**
     * Obtiene todas las jornadas laborales o las de un usuario específico
     *
     * @param int $user_id ID del usuario (opcional)
     * @return array|int Array con las jornadas o <0 si error
     */
    public function getAllJornadas($user_id = 0)
    {
        $jornadas = array();
        
        $sql = "SELECT j.*, u.firstname, u.lastname, u.login";
        $sql .= " FROM " . MAIN_DB_PREFIX . "jornadas_laborales as j";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as u ON j.fk_user = u.rowid";
        $sql .= " WHERE 1=1";
        
        if ($user_id > 0) {
            $sql .= " AND j.fk_user = " . (int)$user_id;
        }
        
        $sql .= " ORDER BY j.fk_user, j.rowid DESC";
        
        dol_syslog("JornadaLaboral::getAllJornadas - SQL: " . $sql, LOG_DEBUG);
        
        $resql = $this->db->query($sql);
        if ($resql) {
            $num = $this->db->num_rows($resql);
            $i = 0;
            
            while ($i < $num) {
                $obj = $this->db->fetch_object($resql);
                
                $jornada = array(
                    'id' => $obj->rowid,
                    'fk_user' => $obj->fk_user,
                    'nombre_usuario' => trim($obj->firstname . ' ' . $obj->lastname) . ' (' . $obj->login . ')',
                    'tipo_jornada' => $obj->tipo_jornada,
                    'tipo_turno' => $obj->tipo_turno,
                    'hora_inicio_jornada' => $obj->hora_inicio_jornada,
                    'hora_inicio_pausa' => $obj->hora_inicio_pausa,
                    'hora_fin_pausa' => $obj->hora_fin_pausa,
                    'hora_fin_jornada' => $obj->hora_fin_jornada,
                    'observaciones' => $obj->observaciones,
                    'fecha_creacion' => $obj->fecha_creacion,
                    'active' => $obj->active
                );
                
                $jornadas[] = $jornada;
                $i++;
            }
            
            $this->db->free($resql);
            return $jornadas;
        } else {
            $this->errors[] = "Error al consultar la base de datos: " . $this->db->lasterror();
            dol_syslog("JornadaLaboral::getAllJornadas - Error: " . $this->db->lasterror(), LOG_ERR);
            return -1;
        }
    }
} 