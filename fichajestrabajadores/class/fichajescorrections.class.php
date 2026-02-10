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
 *  \file       htdocs/custom/fichajestrabajadores/class/fichajescorrections.class.php
 *  \ingroup    fichajestrabajadores
 *  \brief      Class to manage correction requests (solicitudes de fichaje/corrección)
 */

require_once DOL_DOCUMENT_ROOT . '/core/lib/functions.lib.php';

/**
 * Class FichajesCorrections
 */
class FichajesCorrections
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

    public $id;
    public $fk_user;
    public $fecha_jornada;
    public $hora_entrada;
    public $hora_salida;
    public $pausas; // JSON
    public $observaciones;
    public $estado; // pendiente, aprobada, rechazada
    public $fk_approver;
    public $fecha_aprobacion;
    public $fecha_creacion;

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
     * Create a new correction request
     * 
     * @param int $fk_user User ID
     * @param string $fecha_jornada YYYY-MM-DD
     * @param string $hora_entrada YYYY-MM-DD HH:MM:SS
     * @param string $hora_salida YYYY-MM-DD HH:MM:SS
     * @param array $pausas Array of pauses
     * @param string $observaciones Observations
     * @return int ID if OK, <0 if KO
     */
    public function create($fk_user, $fecha_jornada, $hora_entrada, $hora_salida, $pausas = array(), $observaciones = '')
    {
        global $user;

        // Basic validation
        if (empty($fk_user) || empty($fecha_jornada) || (empty($hora_entrada) && empty($hora_salida))) {
            $this->errors[] = "Missing required fields (entrada or salida must be provided)";
            return -1;
        }

        $this->fk_user = $fk_user;
        $this->fecha_jornada = $fecha_jornada;
        $this->hora_entrada = $hora_entrada;
        $this->hora_salida = $hora_salida;
        $this->pausas = json_encode($pausas);
        $this->observaciones = $observaciones;
        $this->estado = 'pendiente';
        $this->fecha_creacion = dol_now(); // server time

        $sql = "INSERT INTO " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections (";
        $sql .= "fk_user, fecha_jornada, hora_entrada, hora_salida, pausas, observaciones, estado, fecha_creacion";
        $sql .= ") VALUES (";
        $sql .= (int) $this->fk_user . ",";
        $sql .= "'" . $this->db->escape($this->fecha_jornada) . "',";
        // Helper to format date for MySQL
        $formatDate = function ($isoDate) {
            if (empty($isoDate))
                return 'NULL';
            $ts = strtotime($isoDate);
            if ($ts === false)
                return 'NULL';
            return "'" . $this->db->escape(date('Y-m-d H:i:s', $ts)) . "'";
        };

        $sql .= $formatDate($this->hora_entrada) . ",";
        $sql .= $formatDate($this->hora_salida) . ",";
        $sql .= "'" . $this->db->escape($this->pausas) . "',";
        $sql .= "'" . $this->db->escape($this->observaciones) . "',";
        $sql .= "'pendiente',";
        $sql .= "'" . $this->db->idate($this->fecha_creacion) . "'";
        $sql .= ")";

        $resql = $this->db->query($sql);
        if ($resql) {
            $this->id = $this->db->last_insert_id(MAIN_DB_PREFIX . "fichajestrabajadores_corrections");
            return $this->id;
        } else {
            $this->error = $this->db->lasterror();
            $this->errors[] = $this->error;
            return -1;
        }
    }

    /**
     * Fetch a correction
     * 
     * @param int $id ID
     * @return int 1 if OK, 0 if not found, -1 if KO
     */
    public function fetch($id)
    {
        $sql = "SELECT * FROM " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections WHERE rowid = " . (int) $id;
        $resql = $this->db->query($sql);
        if ($resql) {
            if ($this->db->num_rows($resql) > 0) {
                $obj = $this->db->fetch_object($resql);
                $this->id = $obj->rowid;
                $this->fk_user = $obj->fk_user;
                $this->fecha_jornada = $obj->fecha_jornada;
                $this->hora_entrada = $obj->hora_entrada;
                $this->hora_salida = $obj->hora_salida;
                $this->pausas = $obj->pausas; // json string
                $this->observaciones = $obj->observaciones;
                $this->estado = $obj->estado;
                $this->fk_approver = $obj->fk_approver;
                $this->fecha_aprobacion = $this->db->jdate($obj->fecha_aprobacion);
                $this->fecha_creacion = $this->db->jdate($obj->fecha_creacion);
                return 1;
            }
            return 0;
        } else {
            $this->error = $this->db->lasterror();
            return -1;
        }
    }

    /**
     * List corrections
     * 
     * @param int $fk_user Optional user filter
     * @param string $estado Optional status filter
     * @return array Array of objects
     */
    public function listCorrections($fk_user = 0, $estado = '')
    {
        $sql = "SELECT c.*, u.firstname, u.lastname, u.login";
        $sql .= " FROM " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections as c";
        $sql .= " LEFT JOIN " . MAIN_DB_PREFIX . "user as u ON c.fk_user = u.rowid";
        $sql .= " WHERE 1=1";

        if ($fk_user > 0) {
            $sql .= " AND c.fk_user = " . (int) $fk_user;
        }
        if (!empty($estado)) {
            $sql .= " AND c.estado = '" . $this->db->escape($estado) . "'";
        }
        $sql .= " ORDER BY c.fecha_creacion DESC";

        $resql = $this->db->query($sql);
        $ret = array();
        if ($resql) {
            while ($obj = $this->db->fetch_object($resql)) {
                $ret[] = $obj;
            }
        }
        return $ret;
    }

    /**
     * Approve a correction request (and apply it as a Manual Jorney)
     * 
     * @param int $id ID of correction
     * @param int $fk_approver ID of approver
     * @return int >0 OK, <0 KO
     */
    public function approve($id, $fk_approver)
    {
        if ($this->fetch($id) <= 0)
            return -1;
        if ($this->estado != 'pendiente') {
            $this->errors[] = "Request not pending";
            return -1;
        }

        $this->db->begin();

        // 1. Mark as approved
        $sql = "UPDATE " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections";
        $sql .= " SET estado = 'aprobada', fk_approver = " . (int) $fk_approver . ", date_approval = '" . $this->db->idate(dol_now()) . "'";
        $sql .= " WHERE rowid = " . (int) $id;

        if (!$this->db->query($sql)) {
            $this->db->rollback();
            $this->errors[] = $this->db->lasterror();
            return -1;
        }

        // 2. Apply the correction (Insert Manual Journey)
        // Need to require the main class
        require_once __DIR__ . '/fichajestrabajadores.class.php';
        $fichaje = new FichajeTrabajador($this->db);

        // Get user login to reuse existing method
        $uSql = "SELECT login FROM " . MAIN_DB_PREFIX . "user WHERE rowid=" . (int) $this->fk_user;
        $uRes = $this->db->query($uSql);
        $uObj = $this->db->fetch_object($uRes);
        $userLogin = $uObj->login;

        // Decode pauses
        $pausasArr = json_decode($this->pausas, true);
        if (!is_array($pausasArr))
            $pausasArr = array();

        // Format times to ISO (fichajestrabajadores expects ISO)
        // In DB we stored as DATETIME (Y-m-d H:i:s), potentially local or UTC depending on how it was saved.
        // Assuming the input was correct, pass it as is, or convert to ISO8601


        $pausasIso = array();
        foreach ($pausasArr as $p) {
            // Support both formats if exist
            $i = isset($p['inicio']) ? $p['inicio'] : (isset($p['start']) ? $p['start'] : '');
            $f = isset($p['fin']) ? $p['fin'] : (isset($p['end']) ? $p['end'] : '');

            // If they are timestamps or raw strings, ensure ISO
            // For simplicity assume the JSON stored valid ISO or date strings
            $pausasIso[] = array('inicio_iso' => $i, 'fin_iso' => $f);
        }

        // Get requester info
        $sqlReq = "SELECT firstname, lastname, login FROM " . MAIN_DB_PREFIX . "user WHERE rowid = " . (int) $this->fk_user;
        $resReq = $this->db->query($sqlReq);
        $objReq = $this->db->fetch_object($resReq);
        $requesterName = $objReq ? ($objReq->firstname . ' ' . $objReq->lastname) : 'Usuario ' . $this->fk_user;

        // Get approver info
        $sqlApp = "SELECT firstname, lastname, login FROM " . MAIN_DB_PREFIX . "user WHERE rowid = " . (int) $fk_approver;
        $resApp = $this->db->query($sqlApp);
        $objApp = $this->db->fetch_object($resApp);
        $approverName = $objApp ? ($objApp->firstname . ' ' . $objApp->lastname) : 'Admin ' . $fk_approver;

        $auditMsg = "Corrección #$id. Solicitado: $requesterName. Aprobado: $approverName.";

        // Use the existing manual insertion logic which handles creating fichajes and the jornada completa
        $res = $fichaje->insertarJornadaManual(
            $userLogin,
            $this->fecha_jornada,
            $this->hora_entrada, // method supports "Y-m-d H:i:s" too usually, let's check
            $this->hora_salida,
            $pausasIso,
            $auditMsg,
            $this->observaciones, // obs_jornada
            $this->fk_user
        );

        if (!$res['success']) {
            $this->db->rollback();
            $this->errors = array_merge($this->errors, $res['errors']);
            return -2;
        }

        $this->db->commit();
        return 1;
    }

    /**
     * Reject a correction request
     * 
     * @param int $id ID of correction
     * @param int $fk_approver ID of approver
     * @return int >0 OK, <0 KO
     */
    public function reject($id, $fk_approver)
    {
        if ($this->fetch($id) <= 0)
            return -1;
        if ($this->estado != 'pendiente') {
            $this->errors[] = "Request not pending";
            return -1;
        }

        $sql = "UPDATE " . MAIN_DB_PREFIX . "fichajestrabajadores_corrections";
        $sql .= " SET estado = 'rechazada', fk_approver = " . (int) $fk_approver . ", date_approval = '" . $this->db->idate(dol_now()) . "'";
        $sql .= " WHERE rowid = " . (int) $id;

        if ($this->db->query($sql)) {
            return 1;
        } else {
            $this->errors[] = $this->db->lasterror();
            return -1;
        }
    }
}
