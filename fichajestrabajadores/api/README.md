# API REST para el Módulo FichajesTrabajadores

Esta API permite gestionar los fichajes de trabajadores a través de peticiones HTTP, sin necesidad de autenticación.

## Endpoints disponibles

### 1. Obtener todos los fichajes

**Endpoint**: `GET /api/fichajes.php`

**Descripción**: Devuelve un listado en formato JSON con todos los fichajes registrados en la base de datos.

**Ejemplo de respuesta exitosa**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": "USUARIO",
      "tipo": "entrar",
      "fecha_creacion": "2024-04-04 10:00:00"
    },
    {
      "id": 2,
      "usuario": "USUARIO",
      "tipo": "salir",
      "fecha_creacion": "2024-04-04 18:00:00"
    }
  ]
}
```

### 2. Registrar una entrada

**Endpoint**: `POST /api/registrarEntrada.php`

**Descripción**: Registra una entrada en el sistema de fichajes.

**Cuerpo de la petición**: No requiere ningún parámetro. El usuario se establece por defecto como "USUARIO" y el tipo como "entrar".

**Ejemplo de respuesta exitosa**:
```json
{
  "success": true,
  "message": "Entrada registrada correctamente",
  "id": 3
}
```

### 3. Registrar una salida

**Endpoint**: `POST /api/registrarSalida.php`

**Descripción**: Registra una salida en el sistema de fichajes.

**Cuerpo de la petición**: No requiere ningún parámetro. El usuario se establece por defecto como "USUARIO" y el tipo como "salir".

**Ejemplo de respuesta exitosa**:
```json
{
  "success": true,
  "message": "Salida registrada correctamente",
  "id": 4
}
```

## Ejemplos de uso con Postman

### Obtener listado de fichajes
1. Crear una nueva petición en Postman
2. Seleccionar el método GET
3. Introducir la URL: `http://tu-servidor-dolibarr/custom/fichajestrabajadores/api/fichajes.php`
4. Enviar la petición

### Registrar una entrada
1. Crear una nueva petición en Postman
2. Seleccionar el método POST
3. Introducir la URL: `http://tu-servidor-dolibarr/custom/fichajestrabajadores/api/registrarEntrada.php`
4. No es necesario añadir ningún parámetro en el cuerpo
5. Enviar la petición

### Registrar una salida
1. Crear una nueva petición en Postman
2. Seleccionar el método POST
3. Introducir la URL: `http://tu-servidor-dolibarr/custom/fichajestrabajadores/api/registrarSalida.php`
4. No es necesario añadir ningún parámetro en el cuerpo
5. Enviar la petición

## Códigos de respuesta

- **200**: Petición exitosa
- **405**: Método no permitido (si se usa un método HTTP diferente al especificado)
- **500**: Error interno del servidor 