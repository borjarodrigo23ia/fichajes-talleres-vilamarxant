# Funcionamiento de las APIs del Módulo FichajesTrabajadores

## Índice
1. [Estructura General](#estructura-general)
2. [Tipos de APIs](#tipos-de-apis)
3. [Ubicación de Archivos](#ubicación-de-archivos)
4. [Configuración Swagger](#configuración-swagger)
5. [Patrones de Implementación](#patrones-de-implementación)
6. [APIs Disponibles](#apis-disponibles)
7. [Ejemplos de Uso](#ejemplos-de-uso)

## Estructura General

El módulo FichajesTrabajadores implementa dos tipos de arquitecturas de API:

### 1. APIs Independientes (Carpeta `/api/`)
- **Ubicación**: `htdocs/custom/fichajestrabajadores/api/`
- **Características**: APIs simples, sin autenticación, acceso directo
- **Propósito**: Endpoints específicos para operaciones puntuales

### 2. API REST Estándar de Dolibarr (Carpeta `/class/api/`)
- **Ubicación**: `htdocs/custom/fichajestrabajadores/class/api/`
- **Características**: Sigue estándares de Dolibarr, con autenticación
- **Propósito**: Integración completa con el sistema de APIs de Dolibarr

## Tipos de APIs

### APIs Independientes
Estas APIs están diseñadas para ser llamadas directamente sin autenticación:

#### Fichajes
- `fichajes.php` - Obtener todos los fichajes (GET)
- `registrarEntrada.php` - Registrar entrada (POST)
- `registrarSalida.php` - Registrar salida (POST)
- `iniciarPausa.php` - Iniciar pausa (POST)
- `terminarPausa.php` - Terminar pausa (POST)

#### Vacaciones
- `vacaciones.php` - Listar solicitudes de vacaciones (GET)
- `crearVacacion.php` - Crear solicitud de vacaciones (POST)
- `getVacacion.php` - Obtener solicitud específica (GET)
- `aprobarVacacion.php` - Aprobar solicitud (POST)
- `rechazarVacacion.php` - Rechazar solicitud (POST)
- `eliminarVacacion.php` - Eliminar solicitud (DELETE)

#### Jornadas
- `jornadas.php` - Gestionar jornadas laborales (GET/POST)

#### Configuración
- `getConfig.php` - Obtener configuración del módulo (GET)

### API REST Estándar
- `api_fichajestrabajadores.class.php` - Clase principal que extiende DolibarrApi

## Ubicación de Archivos

### Estructura de Carpetas
```
fichajestrabajadores/
├── api/                                    # APIs independientes
│   ├── fichajes.php                       # GET fichajes
│   ├── registrarEntrada.php              # POST entrada
│   ├── registrarSalida.php               # POST salida
│   ├── iniciarPausa.php                  # POST iniciar pausa
│   ├── terminarPausa.php                 # POST terminar pausa
│   ├── vacaciones.php                    # GET vacaciones
│   ├── crearVacacion.php                 # POST crear vacación
│   ├── getVacacion.php                   # GET vacación específica
│   ├── aprobarVacacion.php               # POST aprobar vacación
│   ├── rechazarVacacion.php              # POST rechazar vacación
│   ├── eliminarVacacion.php              # DELETE vacación
│   ├── jornadas.php                      # GET/POST jornadas
│   ├── getConfig.php                     # GET configuración
│   ├── index.php                         # Archivo de protección
│   └── README.md                         # Documentación
├── class/api/                            # API REST estándar
│   ├── api_fichajestrabajadores.class.php # Clase principal API
│   └── index.php                         # Archivo de protección
└── swagger/                              # Documentación Swagger
    └── fichajestrabajadores.php          # Especificaciones Swagger
```

### URLs de Acceso

#### APIs Independientes
```
http://tu-servidor-dolibarr/custom/fichajestrabajadores/api/[archivo].php
```

#### API REST Estándar
```
http://tu-servidor-dolibarr/api/index.php/fichajestrabajadores/[endpoint]
```

## Configuración Swagger

### Archivo Principal
- **Ubicación**: `swagger/fichajestrabajadores.php`
- **Función**: Genera documentación automática de la API
- **Especificación**: Swagger 2.0

### Configuración Swagger
```php
$specs = array(
    'swagger' => '2.0',
    'info' => array(
        'version' => '1.0.0',
        'title' => 'FichajesTrabajadores API',
        'description' => 'API para gestionar fichajes y vacaciones de trabajadores'
    ),
    'host' => $_SERVER['HTTP_HOST'],
    'basePath' => $api_url,
    'paths' => [...]
);
```

### Endpoints Documentados en Swagger
- `/vacaciones/crear` (POST)
- `/vacaciones/{id}` (GET, DELETE)
- `/vacaciones/{id}/aprobar` (POST)
- `/vacaciones/{id}/rechazar` (POST)
- `/vacaciones` (GET)

## Patrones de Implementación

### Estructura Común de APIs Independientes

#### 1. Configuración Inicial
```php
// Desactivar verificación CSRF para API
$dolibarr_nocsrfcheck = 1;

// Cargar entorno Dolibarr
$res = 0;
if (!$res && file_exists("../../../main.inc.php")) {
    $res = @include "../../../main.inc.php";
}
if (!$res) {
    die(json_encode(['error' => 'Include of main fails', 'code' => 500]));
}
```

#### 2. Cabeceras HTTP
```php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
```

#### 3. Validación de Métodos
```php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido', 'code' => 405]);
    exit;
}
```

#### 4. Manejo de Errores
```php
try {
    // Lógica de la API
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'code' => 500]);
}
```

#### 5. Respuesta JSON Estándar
```php
// Éxito
echo json_encode([
    'success' => true,
    'data' => $resultado,
    'debug' => $info_debug
]);

// Error
echo json_encode([
    'error' => $mensaje_error,
    'code' => $codigo_http,
    'debug' => $info_debug
]);
```

### Estructura API REST Estándar

#### Clase Base
```php
class FichajesTrabajadoresApi extends DolibarrApi
{
    static $FIELDS = array(
        'usuario',
        'fecha_inicio', 
        'fecha_fin'
    );
}
```

#### Anotaciones para Endpoints
```php
/**
 * @url POST /vacaciones/crear
 * @throws RestException 401 Not authenticated
 * @throws RestException 404 Not found
 * @throws RestException 500 Error creating vacation request
 */
public function createVacacion($request_data = null)
```

## APIs Disponibles

### 1. Gestión de Fichajes

#### Obtener Fichajes
- **Archivo**: `api/fichajes.php`
- **Método**: GET
- **URL**: `/custom/fichajestrabajadores/api/fichajes.php`
- **Descripción**: Devuelve todos los fichajes registrados
- **Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": "USUARIO",
      "tipo": "entrar",
      "fecha_creacion": "2024-04-04 10:00:00"
    }
  ],
  "debug": {...}
}
```

#### Registrar Entrada
- **Archivo**: `api/registrarEntrada.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/registrarEntrada.php`
- **Descripción**: Registra una entrada en el sistema
- **Respuesta**:
```json
{
  "success": true,
  "message": "Entrada registrada correctamente",
  "id": 3
}
```

#### Registrar Salida
- **Archivo**: `api/registrarSalida.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/registrarSalida.php`
- **Descripción**: Registra una salida del sistema
- **Respuesta**:
```json
{
  "success": true,
  "message": "Salida registrada correctamente",
  "id": 4
}
```

#### Iniciar Pausa
- **Archivo**: `api/iniciarPausa.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/iniciarPausa.php`
- **Descripción**: Registra el inicio de una pausa
- **Respuesta**:
```json
{
  "success": true,
  "message": "Pausa iniciada correctamente",
  "id": 5
}
```

#### Terminar Pausa
- **Archivo**: `api/terminarPausa.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/terminarPausa.php`
- **Descripción**: Registra el fin de una pausa

### 2. Gestión de Vacaciones

#### Listar Vacaciones
- **Archivo**: `api/vacaciones.php`
- **Método**: GET
- **URL**: `/custom/fichajestrabajadores/api/vacaciones.php`
- **Parámetros**: 
  - `estado` (opcional): Filtrar por estado
  - `usuario` (opcional): Filtrar por usuario
- **Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": "usuario1",
      "fecha_inicio": "2024-07-01",
      "fecha_fin": "2024-07-15",
      "estado": "pendiente",
      "comentarios": "Vacaciones de verano"
    }
  ]
}
```

#### Crear Vacación
- **Archivo**: `api/crearVacacion.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/crearVacacion.php`
- **Cuerpo**:
```json
{
  "usuario": "usuario1",
  "fecha_inicio": "2024-07-01",
  "fecha_fin": "2024-07-15",
  "comentarios": "Vacaciones de verano"
}
```

#### Obtener Vacación
- **Archivo**: `api/getVacacion.php`
- **Método**: GET
- **URL**: `/custom/fichajestrabajadores/api/getVacacion.php?id=1`

#### Aprobar Vacación
- **Archivo**: `api/aprobarVacacion.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/aprobarVacacion.php`
- **Cuerpo**:
```json
{
  "id": 1,
  "supervisor": "supervisor1",
  "comentarios": "Aprobado"
}
```

#### Rechazar Vacación
- **Archivo**: `api/rechazarVacacion.php`
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/rechazarVacacion.php`

#### Eliminar Vacación
- **Archivo**: `api/eliminarVacacion.php`
- **Método**: DELETE
- **URL**: `/custom/fichajestrabajadores/api/eliminarVacacion.php`

### 3. Gestión de Jornadas

#### Jornadas Laborales
- **Archivo**: `api/jornadas.php`
- **Método**: GET/POST
- **URL**: `/custom/fichajestrabajadores/api/jornadas.php`
- **Descripción**: Gestiona jornadas laborales con control de permisos
- **Parámetros**:
  - `action`: list, get
  - `user_id`: ID del usuario (para filtrar)
  - `id`: ID de jornada específica

### 4. Configuración

#### Obtener Configuración
- **Archivo**: `api/getConfig.php`
- **Método**: GET
- **URL**: `/custom/fichajestrabajadores/api/getConfig.php`
- **Descripción**: Obtiene la configuración del módulo

## Ejemplos de Uso

### Con cURL

#### Obtener Fichajes
```bash
curl -X GET "http://localhost/dolibarr/custom/fichajestrabajadores/api/fichajes.php"
```

#### Registrar Entrada
```bash
curl -X POST "http://localhost/dolibarr/custom/fichajestrabajadores/api/registrarEntrada.php"
```

#### Crear Vacación
```bash
curl -X POST "http://localhost/dolibarr/custom/fichajestrabajadores/api/crearVacacion.php" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "usuario1",
    "fecha_inicio": "2024-07-01", 
    "fecha_fin": "2024-07-15",
    "comentarios": "Vacaciones de verano"
  }'
```

### Con JavaScript (Fetch)

#### Obtener Vacaciones
```javascript
fetch('/custom/fichajestrabajadores/api/vacaciones.php')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Vacaciones:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  });
```

#### Registrar Entrada
```javascript
fetch('/custom/fichajestrabajadores/api/registrarEntrada.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Entrada registrada:', data.id);
  }
});
```

## Códigos de Respuesta HTTP

### Códigos de Éxito
- **200**: OK - Petición exitosa
- **201**: Created - Recurso creado correctamente

### Códigos de Error
- **400**: Bad Request - Datos inválidos o faltantes
- **401**: Unauthorized - No autenticado (solo API REST estándar)
- **404**: Not Found - Recurso no encontrado
- **405**: Method Not Allowed - Método HTTP no permitido
- **500**: Internal Server Error - Error interno del servidor

## Consideraciones de Seguridad

### APIs Independientes
- **Sin autenticación**: Acceso directo sin verificación de usuario
- **CSRF deshabilitado**: `$dolibarr_nocsrfcheck = 1`
- **CORS habilitado**: Permite acceso desde cualquier origen

### API REST Estándar
- **Con autenticación**: Requiere token de API de Dolibarr
- **Control de permisos**: Verifica derechos de usuario
- **Validación de datos**: Campos obligatorios y tipos de datos

## Mantenimiento y Debugging

### Información de Debug
Todas las APIs independientes incluyen información de debug:
```json
{
  "debug": {
    "tabla_existe": true,
    "num_registros": 15,
    "tipo_resultado": "array",
    "es_array": true,
    "cantidad_fichajes": 15
  }
}
```

### Logs de Error
Los errores se capturan y devuelven en formato JSON:
```json
{
  "error": "Mensaje de error",
  "code": 500,
  "details": ["Detalles adicionales"]
}
```

### Archivos de Protección
Todos los directorios contienen archivos `index.php` para prevenir acceso directo al directorio.

## Conclusión

El módulo FichajesTrabajadores implementa un sistema híbrido de APIs que combina:
1. **APIs independientes** para operaciones simples y rápidas
2. **API REST estándar** para integración completa con Dolibarr
3. **Documentación Swagger** para facilitar el desarrollo
4. **Manejo robusto de errores** y debugging
5. **Flexibilidad de acceso** según las necesidades del proyecto

Esta arquitectura permite tanto el uso interno dentro de Dolibarr como la integración con sistemas externos de forma sencilla y eficiente.
