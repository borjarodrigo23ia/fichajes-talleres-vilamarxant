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
 * \file    htdocs/custom/fichajestrabajadores/swagger/fichajestrabajadores.php
 * \ingroup fichajestrabajadores
 * \brief   Swagger documentation for FichajesTrabajadores API
 */

// Load Dolibarr environment
$res = 0;
if (!$res && file_exists("../../../main.inc.php")) {
    $res = @include "../../../main.inc.php";
}
if (!$res && file_exists("../../../../main.inc.php")) {
    $res = @include "../../../../main.inc.php";
}
if (!$res) {
    die("Include of main fails");
}

require_once DOL_DOCUMENT_ROOT.'/api/class/api.class.php';
require_once DOL_DOCUMENT_ROOT.'/custom/fichajestrabajadores/class/api/api_fichajestrabajadores.class.php';

$api = new FichajesTrabajadoresApi($db);

// Generate swagger documentation
$version = '1.0.0';
$api_url = DOL_URL_ROOT.'/custom/fichajestrabajadores/class/api/';

$specs = array(
    'swagger' => '2.0',
    'info' => array(
        'version' => $version,
        'title' => 'FichajesTrabajadores API',
        'description' => 'API para gestionar fichajes y vacaciones de trabajadores'
    ),
    'host' => $_SERVER['HTTP_HOST'],
    'basePath' => $api_url,
    'paths' => array(
        '/vacaciones/crear' => array(
            'post' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Crear una nueva solicitud de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'request_data',
                        'in' => 'body',
                        'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'usuario' => array('type' => 'string'),
                                'fecha_inicio' => array('type' => 'string', 'format' => 'date'),
                                'fecha_fin' => array('type' => 'string', 'format' => 'date'),
                                'comentarios' => array('type' => 'string')
                            )
                        )
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Solicitud creada correctamente',
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'id' => array('type' => 'integer'),
                                'message' => array('type' => 'string')
                            )
                        )
                    )
                )
            )
        ),
        '/vacaciones/{id}' => array(
            'get' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Obtener una solicitud de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'type' => 'integer'
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Solicitud encontrada',
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'id' => array('type' => 'integer'),
                                'usuario' => array('type' => 'string'),
                                'fecha_inicio' => array('type' => 'string', 'format' => 'date'),
                                'fecha_fin' => array('type' => 'string', 'format' => 'date'),
                                'estado' => array('type' => 'string'),
                                'comentarios' => array('type' => 'string')
                            )
                        )
                    )
                )
            ),
            'delete' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Eliminar una solicitud de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'type' => 'integer'
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Solicitud eliminada correctamente'
                    )
                )
            )
        ),
        '/vacaciones/{id}/aprobar' => array(
            'post' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Aprobar una solicitud de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'type' => 'integer'
                    ),
                    array(
                        'name' => 'request_data',
                        'in' => 'body',
                        'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'supervisor' => array('type' => 'string'),
                                'comentarios' => array('type' => 'string')
                            )
                        )
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Solicitud aprobada correctamente'
                    )
                )
            )
        ),
        '/vacaciones/{id}/rechazar' => array(
            'post' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Rechazar una solicitud de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'type' => 'integer'
                    ),
                    array(
                        'name' => 'request_data',
                        'in' => 'body',
                        'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'supervisor' => array('type' => 'string'),
                                'comentarios' => array('type' => 'string')
                            )
                        )
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Solicitud rechazada correctamente'
                    )
                )
            )
        ),
        '/vacaciones' => array(
            'get' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Listar solicitudes de vacaciones',
                'parameters' => array(
                    array(
                        'name' => 'estado',
                        'in' => 'query',
                        'required' => false,
                        'type' => 'string'
                    ),
                    array(
                        'name' => 'usuario',
                        'in' => 'query',
                        'required' => false,
                        'type' => 'string'
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Lista de solicitudes',
                        'schema' => array(
                            'type' => 'array',
                            'items' => array(
                                'type' => 'object',
                                'properties' => array(
                                    'id' => array('type' => 'integer'),
                                    'usuario' => array('type' => 'string'),
                                    'fecha_inicio' => array('type' => 'string', 'format' => 'date'),
                                    'fecha_fin' => array('type' => 'string', 'format' => 'date'),
                                    'estado' => array('type' => 'string'),
                                    'comentarios' => array('type' => 'string')
                                )
                            )
                        )
                    )
                )
            )
        ),
        '/jornadas-completas' => array(
            'get' => array(
                'tags' => array('Jornadas'),
                'summary' => 'Listar jornadas completas',
                'parameters' => array(
                    array('name' => 'usuario_id', 'in' => 'query', 'required' => false, 'type' => 'integer'),
                    array('name' => 'fecha_inicio', 'in' => 'query', 'required' => false, 'type' => 'string'),
                    array('name' => 'fecha_fin', 'in' => 'query', 'required' => false, 'type' => 'string')
                ),
                'responses' => array(
                    '200' => array('description' => 'Lista de jornadas completas')
                )
            )
        ),
        '/jornadas-completas/{id}' => array(
            'get' => array(
                'tags' => array('Jornadas'),
                'summary' => 'Obtener jornada completa por ID',
                'parameters' => array(
                    array('name' => 'id', 'in' => 'path', 'required' => true, 'type' => 'integer')
                ),
                'responses' => array('200' => array('description' => 'Jornada completa'))
            ),
            'put' => array(
                'tags' => array('Jornadas'),
                'summary' => 'Actualizar jornada completa',
                'parameters' => array(
                    array('name' => 'id', 'in' => 'path', 'required' => true, 'type' => 'integer'),
                    array(
                        'name' => 'request_data', 'in' => 'body', 'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'usuario_id' => array('type' => 'integer'),
                                'fecha' => array('type' => 'string', 'format' => 'date'),
                                'hora_entrada' => array('type' => 'string'),
                                'hora_salida' => array('type' => 'string'),
                                'total_pausa' => array('type' => 'string'),
                                'total_trabajo' => array('type' => 'string'),
                                'comentario' => array('type' => 'string')
                            )
                        )
                    )
                ),
                'responses' => array('200' => array('description' => 'Actualización correcta'))
            ),
            'delete' => array(
                'tags' => array('Jornadas'),
                'summary' => 'Eliminar jornada completa',
                'parameters' => array(
                    array('name' => 'id', 'in' => 'path', 'required' => true, 'type' => 'integer')
                ),
                'responses' => array('200' => array('description' => 'Eliminación correcta'))
            )
        ),
        '/jornadas-completas/{id}/logs' => array(
            'get' => array(
                'tags' => array('Jornadas'),
                'summary' => 'Listar registros de auditoría de una jornada completa',
                'parameters' => array(
                    array('name' => 'id', 'in' => 'path', 'required' => true, 'type' => 'integer')
                ),
                'responses' => array('200' => array('description' => 'Lista de registros'))
            )
        ),
        '/vacaciones/dias' => array(
            'get' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Listar días de vacaciones permitidos por usuario para un año',
                'parameters' => array(
                    array(
                        'name' => 'anio',
                        'in' => 'query',
                        'required' => false,
                        'type' => 'integer'
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Lista de usuarios con días',
                        'schema' => array(
                            'type' => 'array',
                            'items' => array(
                                'type' => 'object',
                                'properties' => array(
                                    'fk_user' => array('type' => 'integer'),
                                    'login' => array('type' => 'string'),
                                    'lastname' => array('type' => 'string'),
                                    'firstname' => array('type' => 'string'),
                                    'anio' => array('type' => 'integer'),
                                    'dias' => array('type' => 'integer')
                                )
                            )
                        )
                    )
                )
            )
        ),
        '/vacaciones/dias' => array(
            'put' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Actualizar días de vacaciones de un usuario para un año',
                'parameters' => array(
                    array(
                        'name' => 'request_data',
                        'in' => 'body',
                        'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'fk_user' => array('type' => 'integer'),
                                'anio' => array('type' => 'integer'),
                                'dias' => array('type' => 'integer')
                            )
                        )
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Actualización correcta'
                    ),
                    '403' => array(
                        'description' => 'Permisos insuficientes'
                    )
                )
            ),
            'post' => array(
                'tags' => array('Vacaciones'),
                'summary' => 'Actualizar días de vacaciones de un usuario para un año (compatibilidad)',
                'parameters' => array(
                    array(
                        'name' => 'request_data',
                        'in' => 'body',
                        'required' => true,
                        'schema' => array(
                            'type' => 'object',
                            'properties' => array(
                                'fk_user' => array('type' => 'integer'),
                                'anio' => array('type' => 'integer'),
                                'dias' => array('type' => 'integer')
                            )
                        )
                    )
                ),
                'responses' => array(
                    '200' => array(
                        'description' => 'Actualización correcta'
                    ),
                    '403' => array(
                        'description' => 'Permisos insuficientes'
                    )
                )
            )
        )
    )
);

// Output swagger documentation
header('Content-Type: application/json');
echo json_encode($specs);