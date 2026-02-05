<?php

require_once DOL_DOCUMENT_ROOT . '/api/class/api.class.php';
require_once DOL_DOCUMENT_ROOT . '/custom/fichajestrabajadores/class/vacaciones.class.php';
require_once DOL_DOCUMENT_ROOT . '/custom/fichajestrabajadores/class/vacaciones_dias.class.php';

use Luracast\Restler\RestException;

/**
 * API class for FichajesTrabajadores
 *
 * @access protected
 * @class  FichajesTrabajadoresApi
 */
class FichajesTrabajadoresApi extends DolibarrApi
{
    /**
     * @var array   $FIELDS     Mandatory fields, checked when create and update object
     */
    static $FIELDS = array(
        'usuario',
        'fecha_inicio',
        'fecha_fin'
    );

    /**
     * Constructor
     */
    public function __construct()
    {
        global $db;
        $this->db = $db;
    }

    /**
     * Get user info
     *
     * @return array
     *
     * @url GET /info
     */
    public function info()
    {
        if (!DolibarrApiAccess::$user) {
            throw new RestException(401, 'No autorizado');
        }

        return (array) $this->_cleanObjectDatas(DolibarrApiAccess::$user);
    }

    /**
     * List fichajes
     *
     * Get a list of fichajes
     *
     * @param string    $sortfield  Sort field
     * @param string    $sortorder  Sort order
     * @param int       $limit      Limit for list
     * @param int       $page       Page number
     * @param string    $sqlfilters Other criteria to filter answers separated by a comma
     * @param int       $fk_user    Optional user id to filter fichajes
     * @return array                Array of fichajes objects
     *
     * @url GET /fichajes
     *
     * @throws RestException
     */
    public function index($sortfield = "f.rowid", $sortorder = 'ASC', $limit = 100, $page = 0, $sqlfilters = '', $fk_user = 0)
    {
        global $db;

        // Incluir la clase de fichajes
        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');

        try {
            // Crear objeto de fichajes
            $fichaje = new FichajeTrabajador($db);

            // Determinar si se ha solicitado filtrar por usuario
            $userId = 0;

            // Priorizar el parámetro tipado de Restler
            if (!empty($fk_user)) {
                $userId = (int) $fk_user;
            } elseif (!empty($_GET['fk_user'])) {
                // Fallback por si Restler no mapea correctamente el parámetro
                $userId = (int) $_GET['fk_user'];
            }

            // SEGURIDAD: Si no es admin, forzar el filtro al usuario actual
            if (!DolibarrApiAccess::$user->admin) {
                $userId = DolibarrApiAccess::$user->id;
            }

            // Obtener todos los fichajes
            $fichajes = $fichaje->getAllFichajes($userId);

            if (is_array($fichajes)) {
                // Aplicar paginación
                if ($limit > 0 && $page > 0) {
                    $fichajes = array_slice($fichajes, ($limit * ($page - 1)), $limit);
                } elseif ($limit > 0) {
                    $fichajes = array_slice($fichajes, 0, $limit);
                }

                return $fichajes;
            } else {
                return array();
            }
        } catch (Exception $e) {
            throw new RestException(500, 'Error inesperado: ' . $e->getMessage());
        }
    }

    /**
     * Registrar entrada
     *
     * @param array $request_data   Request data
     * @return  array   Array con el resultado
     *
     * @url POST /registrarEntrada
     *
     * @throws RestException
     */
    public function registrarEntrada($request_data = null)
    {
        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');
        try {
            $fichaje = new FichajeTrabajador($this->db);

            // SEGURIDAD: Forzar usuario autenticado
            $usuario = DolibarrApiAccess::$user->login;
            $user_id = DolibarrApiAccess::$user->id;

            $observaciones = isset($request_data['observaciones']) ? $request_data['observaciones'] : '';
            $latitud = isset($request_data['latitud']) ? floatval($request_data['latitud']) : null;
            $longitud = isset($request_data['longitud']) ? floatval($request_data['longitud']) : null;

            // DEBUG: Log geolocation data
            error_log("[GEOLOCATION DEBUG] Request data: " . json_encode($request_data));
            error_log("[GEOLOCATION DEBUG] Latitud: " . var_export($latitud, true));
            error_log("[GEOLOCATION DEBUG] Longitud: " . var_export($longitud, true));

            if ($latitud !== null && $longitud !== null) {
                $result = $fichaje->registrarEntrada($usuario, $observaciones, $latitud, $longitud, $user_id);
            } else {
                $result = $fichaje->registrarEntrada($usuario, $observaciones, null, null, $user_id);
            }

            if ($result > 0)
                return array('success' => true, 'message' => 'Entrada registrada', 'id' => $result);
            throw new RestException(500, 'Error: ' . implode(', ', $fichaje->errors));
        } catch (Exception $e) {
            throw new RestException(500, $e->getMessage());
        }
    }

    /**
     * Registrar salida
     *
     * @param array $request_data   Request data
     * @return  array   Array con el resultado
     *
     * @url POST /registrarSalida
     *
     * @throws RestException
     */
    public function registrarSalida($request_data = null)
    {
        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');
        try {
            $fichaje = new FichajeTrabajador($this->db);

            // SEGURIDAD: Forzar usuario autenticado
            $usuario = DolibarrApiAccess::$user->login;
            $user_id = DolibarrApiAccess::$user->id;

            $observaciones = isset($request_data['observaciones']) ? $request_data['observaciones'] : '';
            $latitud = isset($request_data['latitud']) ? floatval($request_data['latitud']) : null;
            $longitud = isset($request_data['longitud']) ? floatval($request_data['longitud']) : null;

            if ($latitud !== null && $longitud !== null) {
                $result = $fichaje->registrarSalida($usuario, $observaciones, $latitud, $longitud, $user_id);
            } else {
                $result = $fichaje->registrarSalida($usuario, $observaciones, null, null, $user_id);
            }

            if ($result > 0)
                return array('success' => true, 'message' => 'Salida registrada', 'id' => $result);
            throw new RestException(500, 'Error: ' . implode(', ', $fichaje->errors));
        } catch (Exception $e) {
            throw new RestException(500, $e->getMessage());
        }
    }

    /**
     * Iniciar pausa
     *
     * @param array $request_data   Request data
     * @return  array   Array con el resultado
     *
     * @url POST /iniciarPausa
     *
     * @throws RestException
     */
    public function iniciarPausa($request_data = null)
    {
        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');
        try {
            $fichaje = new FichajeTrabajador($this->db);

            // SEGURIDAD: Forzar usuario autenticado
            $usuario = DolibarrApiAccess::$user->login;
            $user_id = DolibarrApiAccess::$user->id;

            $observaciones = isset($request_data['observaciones']) ? $request_data['observaciones'] : '';
            $latitud = isset($request_data['latitud']) ? floatval($request_data['latitud']) : null;
            $longitud = isset($request_data['longitud']) ? floatval($request_data['longitud']) : null;

            if ($latitud !== null && $longitud !== null) {
                $result = $fichaje->iniciarPausa($usuario, $observaciones, $latitud, $longitud, $user_id);
            } else {
                $result = $fichaje->iniciarPausa($usuario, $observaciones, null, null, $user_id);
            }

            if ($result > 0)
                return array('success' => true, 'message' => 'Pausa iniciada', 'id' => $result);
            throw new RestException(500, 'Error: ' . implode(', ', $fichaje->errors));
        } catch (Exception $e) {
            throw new RestException(500, $e->getMessage());
        }
    }

    /**
     * Terminar pausa
     *
     * @param array $request_data   Request data
     * @return  array   Array con el resultado
     *
     * @url POST /terminarPausa
     *
     * @throws RestException
     */
    public function terminarPausa($request_data = null)
    {
        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');
        try {
            $fichaje = new FichajeTrabajador($this->db);

            // SEGURIDAD: Forzar usuario autenticado
            $usuario = DolibarrApiAccess::$user->login;
            $user_id = DolibarrApiAccess::$user->id;

            $observaciones = isset($request_data['observaciones']) ? $request_data['observaciones'] : '';
            $latitud = isset($request_data['latitud']) ? floatval($request_data['latitud']) : null;
            $longitud = isset($request_data['longitud']) ? floatval($request_data['longitud']) : null;

            if ($latitud !== null && $longitud !== null) {
                $result = $fichaje->terminarPausa($usuario, $observaciones, $latitud, $longitud, $user_id);
            } else {
                $result = $fichaje->terminarPausa($usuario, $observaciones, null, null, $user_id);
            }

            if ($result > 0)
                return array('success' => true, 'message' => 'Pausa terminada', 'id' => $result);
            throw new RestException(500, 'Error: ' . implode(', ', $fichaje->errors));
        } catch (Exception $e) {
            throw new RestException(500, $e->getMessage());
        }
    }

    /**
     * Insertar jornada completa de manera manual (entrada/salida/pausas con timestamp)
     *
     * @param array $request_data Request data
     *  - usuario: login del usuario (opcional, por defecto login del token)
     *  - fecha: YYYY-MM-DD
     *  - entrada_iso: ISO 8601 UTC (con Z recomendado)
     *  - salida_iso: ISO 8601 UTC (con Z recomendado)
     *  - pausas: array de { inicio_iso, fin_iso }
     *
     * @return array
     *
     * @url POST /insertarJornadaManual
     *
     * @throws RestException
     */
    public function insertarJornadaManual($request_data = null)
    {
        global $user;

        dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');

        try {
            $fichaje = new FichajeTrabajador($this->db);

            $usuario = isset($request_data['usuario']) ? $request_data['usuario'] : $user->login;
            $fecha = isset($request_data['fecha']) ? $request_data['fecha'] : '';
            $entrada_iso = isset($request_data['entrada_iso']) ? $request_data['entrada_iso'] : '';
            $salida_iso = isset($request_data['salida_iso']) ? $request_data['salida_iso'] : '';
            $pausasRaw = isset($request_data['pausas']) && is_array($request_data['pausas']) ? $request_data['pausas'] : array();
            // Normalizar: a veces llega como array de stdClass (JSON decode)
            $pausas = array();
            foreach ($pausasRaw as $p) {
                if (is_object($p))
                    $p = (array) $p;
                if (is_array($p))
                    $pausas[] = $p;
            }

            $obs_fichaje = 'Insertado de manera manual por el trabajador';
            $obs_jornada = 'Jornada insertada de manera manual por el trabajador';

            $result = $fichaje->insertarJornadaManual($usuario, $fecha, $entrada_iso, $salida_iso, $pausas, $obs_fichaje, $obs_jornada, $user->id);

            if (!is_array($result) || empty($result['success'])) {
                throw new RestException(500, 'Error al insertar jornada manual: ' . implode(', ', $fichaje->errors));
            }

            return array(
                'success' => true,
                'message' => 'Jornada manual insertada correctamente',
                'ids_fichajes' => $result['ids_fichajes'],
                'id_jornada' => $result['id_jornada']
            );
        } catch (Exception $e) {
            throw new RestException(500, 'Error inesperado: ' . $e->getMessage());
        }
    }

    /**
     * Create vacation request
     *
     * @param array $request_data   Request data
     * @return array
     *
     * @url POST /vacaciones/crear
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 404 Not found
     * @throws RestException 500 Error creating vacation request
     */
    public function createVacacion($request_data = null)
    {
        if (!isset($request_data)) {
            throw new RestException(400, 'Datos de solicitud requeridos');
        }

        // Validar campos obligatorios
        foreach (self::$FIELDS as $field) {
            if (!isset($request_data[$field])) {
                throw new RestException(400, "Campo requerido: $field");
            }
        }

        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->registrarVacaciones(
            $request_data['usuario'],
            $request_data['fecha_inicio'],
            $request_data['fecha_fin'],
            isset($request_data['comentarios']) ? $request_data['comentarios'] : ''
        );

        if ($result < 0) {
            throw new RestException(500, 'Error al crear la solicitud: ' . join(', ', $vacaciones->errors));
        }

        return array(
            'id' => $result,
            'message' => 'Solicitud creada correctamente'
        );
    }

    /**
     * Get vacation request
     *
     * @param int $id ID of vacation request
     * @return array
     *
     * @url GET /vacaciones/{id}
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 404 Not found
     */
    public function getVacacion($id)
    {
        if (!$id) {
            throw new RestException(400, 'ID de solicitud requerido');
        }

        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->getVacacionesById($id);

        if (!$result) {
            throw new RestException(404, 'Solicitud no encontrada');
        }

        return (array) $this->_cleanObjectDatas($result);
    }

    /**
     * Approve vacation request
     *
     * @param int $id ID of vacation request
     * @param array $request_data Request data
     * @return array
     *
     * @url POST /vacaciones/{id}/aprobar
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 404 Not found
     * @throws RestException 500 Error approving vacation request
     */
    public function aprobarVacacion($id, $request_data = null)
    {
        if (!isset($request_data) || !isset($request_data['supervisor'])) {
            throw new RestException(400, 'Supervisor requerido');
        }

        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->aprobarSolicitud(
            $id,
            $request_data['supervisor'],
            isset($request_data['comentarios']) ? $request_data['comentarios'] : ''
        );

        if ($result < 0) {
            throw new RestException(500, 'Error al aprobar la solicitud: ' . join(', ', $vacaciones->errors));
        }

        return array(
            'message' => 'Solicitud aprobada correctamente'
        );
    }

    /**
     * Reject vacation request
     *
     * @param int $id ID of vacation request
     * @param array $request_data Request data
     * @return array
     *
     * @url POST /vacaciones/{id}/rechazar
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 404 Not found
     * @throws RestException 500 Error rejecting vacation request
     */
    public function rechazarVacacion($id, $request_data = null)
    {
        if (!isset($request_data) || !isset($request_data['supervisor'])) {
            throw new RestException(400, 'Supervisor requerido');
        }

        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->rechazarSolicitud(
            $id,
            $request_data['supervisor'],
            isset($request_data['comentarios']) ? $request_data['comentarios'] : ''
        );

        if ($result < 0) {
            throw new RestException(500, 'Error al rechazar la solicitud: ' . join(', ', $vacaciones->errors));
        }

        return array(
            'message' => 'Solicitud rechazada correctamente'
        );
    }

    /**
     * Delete vacation request
     *
     * @param int $id ID of vacation request
     * @return array
     *
     * @url DELETE /vacaciones/{id}
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 404 Not found
     * @throws RestException 500 Error deleting vacation request
     */
    public function deleteVacacion($id)
    {
        if (!$id) {
            throw new RestException(400, 'ID de solicitud requerido');
        }

        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->eliminarSolicitud($id);

        if ($result < 0) {
            throw new RestException(500, 'Error al eliminar la solicitud: ' . join(', ', $vacaciones->errors));
        }

        return array(
            'message' => 'Solicitud eliminada correctamente'
        );
    }

    /**
     * List vacation requests
     *
     * Get a list of vacation requests
     *
     * @param string $estado Filter by status
     * @param string $usuario Filter by user
     * @return array
     *
     * @url GET /vacaciones
     * 
     * @throws RestException 401 Not authenticated
     * @throws RestException 500 Error getting vacation requests
     */
    public function listVacaciones($estado = '', $usuario = '')
    {
        $vacaciones = new Vacaciones($this->db);
        $result = $vacaciones->getAllVacaciones($estado, $usuario);

        if (!is_array($result)) {
            throw new RestException(500, 'Error al obtener las solicitudes: ' . join(', ', $vacaciones->errors));
        }

        return $result;
    }

    /**
     * Listar días de vacaciones permitidos por usuario para un año
     *
     * @param int $anio Año (opcional, por defecto año actual)
     * @return array
     *
     * @url GET /vacaciones/dias
     */
    public function listVacacionesDias($anio = 0)
    {
        global $conf;
        $anio = (int) ($anio ?: date('Y'));
        $svc = new VacacionesDias($this->db);
        $svc->backfillForYear($anio, $conf->entity);
        return $svc->listByYear($anio, $conf->entity);
    }

    /**
     * Actualizar días de vacaciones de un usuario para un año
     *
     * @param array $request_data { fk_user, anio, dias }
     * @return array
     *
     * @url POST /vacaciones/dias/set
     */
    public function setVacacionesDias($request_data = null)
    {
        global $user, $conf;
        if (empty($user->rights->fichajestrabajadores->vacacioneseditdays)) {
            throw new RestException(403, 'Permisos insuficientes');
        }
        if (!is_array($request_data)) {
            throw new RestException(400, 'Cuerpo requerido');
        }
        $fk_user = isset($request_data['fk_user']) ? (int) $request_data['fk_user'] : 0;
        $anio = isset($request_data['anio']) ? (int) $request_data['anio'] : (int) date('Y');
        $dias = isset($request_data['dias']) ? (int) $request_data['dias'] : null;
        if ($fk_user <= 0 || $dias === null) {
            throw new RestException(400, 'Parámetros inválidos');
        }
        $svc = new VacacionesDias($this->db);
        $res = $svc->setDays($fk_user, $anio, $dias, $conf->entity);
        if ($res < 0) {
            throw new RestException(500, 'No se pudo actualizar: ' . join(', ', $svc->errors));
        }
        return array('success' => true);
    }

    /**
     * Actualizar días de vacaciones (PUT)
     *
     * @param array $request_data { fk_user, anio, dias }
     * @return array
     *
     * @url PUT /vacaciones/dias
     */
    public function putVacacionesDias($request_data = null)
    {
        return $this->setVacacionesDias($request_data);
    }

    /**
     * List original modified snapshots
     *
     * @param int    $id_jornada Filter by jornada id (optional)
     * @param int    $usuario_id Filter by user id (optional)
     * @param string $desde      Filter by modification date from (YYYY-MM-DD)
     * @param string $hasta      Filter by modification date to (YYYY-MM-DD)
     * @param int    $limit      Max results
     * @param int    $offset     Offset for pagination
     * @return array
     *
     * @url GET /fichajes-originales-modificados
     */
    public function listFichajesOriginalesModificados($id_jornada = 0, $usuario_id = 0, $desde = '', $hasta = '', $limit = 100, $offset = 0)
    {
        global $conf;

        $rows = array();
        $sql = "SELECT * FROM " . MAIN_DB_PREFIX . "fichajes_originales_modificados WHERE entity = " . (int) $conf->entity;
        if ($id_jornada > 0) {
            $sql .= " AND id_jornada = " . (int) $id_jornada;
        }
        if ($usuario_id > 0) {
            $sql .= " AND usuario_id = " . (int) $usuario_id;
        }
        if (!empty($desde)) {
            $sql .= " AND modificado_en >= '" . $this->db->escape($desde) . " 00:00:00'";
        }
        if (!empty($hasta)) {
            $sql .= " AND modificado_en <= '" . $this->db->escape($hasta) . " 23:59:59'";
        }
        $sql .= " ORDER BY modificado_en DESC";
        $sql .= " LIMIT " . (int) $limit . " OFFSET " . (int) $offset;

        $resql = $this->db->query($sql);
        if ($resql) {
            while ($obj = $this->db->fetch_object($resql)) {
                $rows[] = $obj;
            }
            $this->db->free($resql);
            return $rows;
        }

        throw new RestException(500, 'Error al obtener el historial: ' . $this->db->lasterror());
    }

    /**
     * Get one original modified snapshot by id
     *
     * @param int $id Snapshot rowid
     * @return array
     *
     * @url GET /fichajes-originales-modificados/{id}
     */
    public function getFichajeOriginalModificado($id)
    {
        if (!$id) {
            throw new RestException(400, 'ID requerido');
        }

        $sql = "SELECT * FROM " . MAIN_DB_PREFIX . "fichajes_originales_modificados WHERE rowid = " . (int) $id;
        $resql = $this->db->query($sql);
        if ($resql) {
            $obj = $this->db->fetch_object($resql);
            $this->db->free($resql);
            if ($obj)
                return (array) $obj;
            throw new RestException(404, 'No encontrado');
        }

        throw new RestException(500, 'Error al obtener el registro: ' . $this->db->lasterror());
    }
    /**
     * Get user configuration
     *
     * @param int $id User ID
     * @return array
     *
     * @url GET /userconfig/{id}
     */
    public function getUserConfig($id)
    {
        global $db;

        require_once DOL_DOCUMENT_ROOT . '/custom/fichajestrabajadores/class/fichajestrabajadoresconfig.class.php';
        $confClass = new FichajesTrabajadoresConfig($db);

        $config = array();
        $allowed = $confClass->getAllowedParams();

        foreach ($allowed as $param) {
            $val = $confClass->getParamValue($param, $id);
            if ($val !== false) {
                $config[$param] = $val;
            }
        }

        return $config;
    }

    /**
     * Set user configuration
     *
     * @param int $id User ID
     * @param array $request_data { param_name, value }
     * @return array
     *
     * @url POST /users/{id}/config
     */
    public function setUserConfig($id, $request_data = null)
    {
        global $db;

        require_once DOL_DOCUMENT_ROOT . '/custom/fichajestrabajadores/class/fichajestrabajadoresconfig.class.php';

        if (!is_array($request_data)) {
            throw new RestException(400, 'Bad Request: Missing body data');
        }

        $param_name = isset($request_data['param_name']) ? $request_data['param_name'] : '';
        $value = isset($request_data['value']) ? $request_data['value'] : '';

        $confClass = new FichajesTrabajadoresConfig($db);
        $res = $confClass->setUserParamValue($id, $param_name, $value);

        if ($res > 0) {
            return array('success' => true, 'message' => 'Configurada actualizada', 'debug_value' => $value);
        }

        throw new RestException(500, 'Error al actualizar configuración');
    }
}