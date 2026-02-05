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
 * \file    htdocs/custom/fichajestrabajadores/class/api_fichajestrabajadores/index.php
 * \ingroup fichajestrabajadores
 * \brief   Archivo para exponer el módulo FichajesTrabajadores a la API de Dolibarr
 */

use Luracast\Restler\RestException;

require_once DOL_DOCUMENT_ROOT.'/api/class/api.class.php';
dol_include_once('/fichajestrabajadores/class/fichajestrabajadores.class.php');

/**
 * API class for Fichajestrabajadores module
 *
 * @access protected
 * @class  Api
 * @module Fichajestrabajadores
 */
class FichajestrabajadoresApi extends DolibarrApi
{
    /**
     * @var FichajeTrabajador $fichaje Objeto con los datos de fichajes
     */
    private $fichaje;

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
        $this->fichaje = new FichajeTrabajador($this->db);
    }

    /**
     * Lista de todos los fichajes
     *
     * Devuelve un listado con todos los fichajes registrados en el sistema
     *
     * @return array Lista de fichajes
     * 
     * @url GET /fichajes
     * @access protected
     */
    public function getFichajes()
    {
        $result = $this->fichaje->getAllFichajes();
        
        if (!is_array($result)) {
            throw new RestException(500, 'Error al obtener fichajes: ' . $this->fichaje->error);
        }
        
        return $result;
    }

    /**
     * Registrar una entrada
     *
     * Registra un nuevo fichaje de entrada en el sistema
     *
     * @return array Resultado del registro
     * 
     * @url POST /registrarEntrada
     * @access protected
     */
    public function registrarEntrada()
    {
        $result = $this->fichaje->registrarEntrada();
        
        if ($result <= 0) {
            throw new RestException(500, 'Error al registrar entrada: ' . implode(', ', $this->fichaje->errors));
        }
        
        return [
            'success' => true,
            'message' => 'Entrada registrada correctamente',
            'id' => $result
        ];
    }

    /**
     * Registrar una salida
     *
     * Registra un nuevo fichaje de salida en el sistema
     *
     * @return array Resultado del registro
     * 
     * @url POST /registrarSalida
     * @access protected
     */
    public function registrarSalida()
    {
        $result = $this->fichaje->registrarSalida();
        
        if ($result <= 0) {
            throw new RestException(500, 'Error al registrar salida: ' . implode(', ', $this->fichaje->errors));
        }
        
        return [
            'success' => true,
            'message' => 'Salida registrada correctamente',
            'id' => $result
        ];
    }

    /**
     * Método por defecto
     *
     * @return array Información del módulo FichajesTrabajadores
     * 
     * @url GET /
     * @access protected
     */
    public function index()
    {
        return [
            'module' => 'fichajestrabajadores',
            'description' => 'API para gestionar fichajes de trabajadores',
            'version' => '1.0',
            'endpoints' => [
                'GET /fichajes' => 'Obtener listado de fichajes',
                'POST /registrarEntrada' => 'Registrar entrada',
                'POST /registrarSalida' => 'Registrar salida'
            ]
        ];
    }
} 