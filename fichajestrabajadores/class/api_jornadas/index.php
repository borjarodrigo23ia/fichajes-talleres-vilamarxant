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
 * \file    htdocs/custom/fichajestrabajadores/class/api_jornadas/index.php
 * \ingroup fichajestrabajadores
 * \brief   Archivo para exponer la gestión de jornadas laborales a la API de Dolibarr
 */

use Luracast\Restler\RestException;

require_once DOL_DOCUMENT_ROOT.'/api/class/api.class.php';
dol_include_once('/fichajestrabajadores/class/jornadalaboral.class.php');

/**
 * API class for Jornadas Laborales
 *
 * @access protected
 * @class  Api
 * @module Fichajestrabajadores
 */
class JornadasLaboralesApi extends DolibarrApi
{
    /**
     * @var JornadaLaboral $jornada Objeto con los datos de jornadas laborales
     */
    private $jornada;

    /**
     * Constructor
     *
     * @url     GET /
     *
     */
    public function __construct()
    {
        global $db, $conf;
        $this->db = $db;
        $this->jornada = new JornadaLaboral($this->db);
    }

    /**
     * Lista de todas las jornadas laborales
     *
     * Devuelve un listado con todas las jornadas laborales registradas en el sistema
     *
     * @param int $user_id ID del usuario (opcional)
     * @return array Lista de jornadas laborales
     * 
     * @url GET /
     * @url GET /jornadas
     * @access protected
     */
    public function getJornadas($user_id = 0)
    {
        $result = $this->jornada->getAllJornadas($user_id);
        
        if (!is_array($result)) {
            throw new RestException(500, 'Error al obtener jornadas laborales: ' . $this->jornada->error);
        }
        
        return $result;
    }

    /**
     * Obtener una jornada laboral
     *
     * Devuelve la información de una jornada laboral específica
     *
     * @param int $id ID de la jornada laboral a obtener
     * @return array Datos de la jornada laboral
     * 
     * @url GET /jornada/{id}
     * @access protected
     */
    public function getJornada($id)
    {
        if (!DolibarrApiAccess::$user->rights->fichajestrabajadores->read) {
            throw new RestException(401);
        }
        
        $result = $this->jornada->fetch($id);
        
        if ($result < 0) {
            throw new RestException(500, 'Error al obtener la jornada laboral: ' . $this->jornada->error);
        }
        
        if ($result === 0) {
            throw new RestException(404, 'Jornada laboral no encontrada');
        }
        
        return $this->_cleanObjectDatas($this->jornada);
    }

    /**
     * Crear una jornada laboral
     *
     * Crea un nuevo registro de jornada laboral en el sistema
     *
     * @param array $request_data Datos de la jornada laboral a crear
     * @return array Resultado de la creación
     * 
     * @url POST /jornada
     * @access protected
     */
    public function createJornada($request_data = null)
    {
        if (!DolibarrApiAccess::$user->rights->fichajestrabajadores->write) {
            throw new RestException(401);
        }
        
        // Verificar datos mínimos requeridos
        if (empty($request_data['fk_user']) || 
            empty($request_data['tipo_jornada']) || 
            empty($request_data['tipo_turno']) || 
            empty($request_data['hora_inicio_jornada']) || 
            empty($request_data['hora_fin_jornada'])) {
            throw new RestException(400, 'Faltan campos obligatorios');
        }
        
        $result = $this->jornada->create($request_data['fk_user'], $request_data);
        
        if ($result <= 0) {
            throw new RestException(500, 'Error al crear la jornada laboral: ' . implode(', ', $this->jornada->errors));
        }
        
        return [
            'success' => true,
            'message' => 'Jornada laboral creada correctamente',
            'id' => $result
        ];
    }

    /**
     * Actualizar una jornada laboral
     *
     * Actualiza los datos de una jornada laboral existente
     *
     * @param int $id ID de la jornada laboral a actualizar
     * @param array $request_data Datos de la jornada laboral a actualizar
     * @return array Resultado de la actualización
     * 
     * @url PUT /jornada/{id}
     * @access protected
     */
    public function updateJornada($id, $request_data = null)
    {
        if (!DolibarrApiAccess::$user->rights->fichajestrabajadores->write) {
            throw new RestException(401);
        }
        
        // Verificar que exista la jornada
        $result = $this->jornada->fetch($id);
        if ($result <= 0) {
            throw new RestException(404, 'Jornada laboral no encontrada');
        }
        
        $result = $this->jornada->update($id, $request_data);
        
        if ($result <= 0) {
            throw new RestException(500, 'Error al actualizar la jornada laboral: ' . implode(', ', $this->jornada->errors));
        }
        
        return [
            'success' => true,
            'message' => 'Jornada laboral actualizada correctamente'
        ];
    }

    /**
     * Eliminar una jornada laboral
     *
     * Elimina una jornada laboral existente
     *
     * @param int $id ID de la jornada laboral a eliminar
     * @return array Resultado de la eliminación
     * 
     * @url DELETE /jornada/{id}
     * @access protected
     */
    public function deleteJornada($id)
    {
        if (!DolibarrApiAccess::$user->rights->fichajestrabajadores->delete) {
            throw new RestException(401);
        }
        
        // Verificar que exista la jornada
        $result = $this->jornada->fetch($id);
        if ($result <= 0) {
            throw new RestException(404, 'Jornada laboral no encontrada');
        }
        
        $result = $this->jornada->delete($id);
        
        if ($result <= 0) {
            throw new RestException(500, 'Error al eliminar la jornada laboral: ' . implode(', ', $this->jornada->errors));
        }
        
        return [
            'success' => true,
            'message' => 'Jornada laboral eliminada correctamente'
        ];
    }

    /**
     * Método por defecto
     *
     * @return array Información de la API de jornadas laborales
     * 
     * @url GET /info
     * @access protected
     */
    public function getInfo()
    {
        return [
            'module' => 'fichajestrabajadores',
            'submodule' => 'jornadas_laborales',
            'description' => 'API para gestionar jornadas laborales de trabajadores',
            'version' => '1.0',
            'endpoints' => [
                'GET /jornadas' => 'Obtener listado de jornadas laborales',
                'GET /jornada/{id}' => 'Obtener detalle de una jornada laboral',
                'POST /jornada' => 'Crear una nueva jornada laboral',
                'PUT /jornada/{id}' => 'Actualizar una jornada laboral existente',
                'DELETE /jornada/{id}' => 'Eliminar una jornada laboral'
            ]
        ];
    }

    /**
     * Limpia los datos de un objeto para la respuesta de la API
     *
     * @param object $object Objeto a limpiar
     * @return array Datos limpios
     */
    private function _cleanObjectDatas($object)
    {
        // Se convierte a array para facilitar la manipulación
        $object = (array) $object;
        
        // Se eliminan los campos privados/protegidos
        unset($object['db']);
        unset($object['error']);
        unset($object['errors']);
        
        // Se renombra el campo id por rowid si es necesario
        if (isset($object['id']) && !isset($object['rowid'])) {
            $object['rowid'] = $object['id'];
        }
        
        return $object;
    }
} 