# Módulo de Vacaciones - FichajesTrabajadores

## Descripción

Este módulo extiende la funcionalidad del módulo FichajesTrabajadores para incluir la gestión de solicitudes de vacaciones de los trabajadores.

## Características

- **Solicitud de vacaciones**: Los trabajadores pueden solicitar vacaciones especificando fechas de inicio y fin
- **Gestión de solicitudes**: Los administradores pueden aprobar o rechazar solicitudes
- **Validaciones**: Verificación de solapamientos y fechas válidas
- **Estados**: Pendiente, Aprobado, Rechazado
- **Comentarios**: Sistema de comentarios para cada solicitud

## Instalación

### 1. Crear la tabla de base de datos

Ejecutar el script de instalación:

```
http://tu-dominio.com/custom/fichajestrabajadores/install_vacaciones.php
```

O ejecutar manualmente el SQL:

```sql
-- Ver archivo: sql/llx_fichajestrabajadores_vacaciones.sql
```

### 2. Acceder a la funcionalidad

Navegar a:

```
http://tu-dominio.com/custom/fichajestrabajadores/vacaciones.php
```

## Estructura de archivos

```
htdocs/custom/fichajestrabajadores/
├── vacaciones.php                    # Página principal de vacaciones
├── class/vacaciones.class.php        # Clase para gestionar vacaciones
├── sql/llx_fichajestrabajadores_vacaciones.sql  # Estructura de la tabla
├── install_vacaciones.php            # Script de instalación
└── langs/es_ES/fichajestrabajadores.lang  # Traducciones (actualizado)
```

## Funcionalidades

### Para Trabajadores

1. **Solicitar Vacaciones**
   - Seleccionar fecha de inicio y fin
   - Agregar comentarios opcionales
   - Validación automática de solapamientos

2. **Ver Mis Solicitudes**
   - Lista de todas las solicitudes propias
   - Estado actual de cada solicitud
   - Posibilidad de eliminar solicitudes pendientes

### Para Administradores

1. **Gestionar Solicitudes**
   - Ver todas las solicitudes pendientes
   - Aprobar o rechazar solicitudes
   - Agregar comentarios de aprobación/rechazo

## Estados de las Solicitudes

- **Pendiente**: Solicitud creada, esperando aprobación
- **Aprobado**: Solicitud aprobada por un administrador
- **Rechazado**: Solicitud rechazada por un administrador

## Validaciones

- Fechas de inicio y fin obligatorias
- Fecha de fin debe ser posterior a fecha de inicio
- No se permiten solapamientos con otras solicitudes del mismo usuario
- Solo se pueden modificar/eliminar solicitudes pendientes

## Permisos

Los permisos se basan en los permisos existentes del módulo FichajesTrabajadores:

- **Leer**: Ver solicitudes de vacaciones
- **Escribir**: Crear y modificar solicitudes
- **Configurar**: Gestionar solicitudes de otros usuarios

## Base de Datos

### Tabla: llx_fichajestrabajadores_vacaciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| rowid | int | ID único |
| usuario | varchar(255) | Login del usuario |
| fecha_inicio | date | Fecha de inicio de vacaciones |
| fecha_fin | date | Fecha de fin de vacaciones |
| estado | varchar(50) | Estado: pendiente, aprobado, rechazado |
| comentarios | text | Comentarios de la solicitud |
| aprobado_por | varchar(255) | Usuario que aprobó/rechazó |
| fecha_aprobacion | datetime | Fecha de aprobación/rechazo |
| fecha_creacion | datetime | Fecha de creación de la solicitud |
| entity | int | Entidad (multiempresa) |

## API

La clase `Vacaciones` proporciona los siguientes métodos principales:

- `registrarVacaciones($usuario, $fecha_inicio, $fecha_fin, $comentarios)`
- `aprobarSolicitud($id, $supervisor, $comentarios)`
- `rechazarSolicitud($id, $supervisor, $comentarios)`
- `eliminarSolicitud($id)`
- `getAllVacaciones($filtro_estado, $filtro_usuario)`

## Traducciones

Las traducciones están incluidas en el archivo de idioma español:

```
htdocs/custom/fichajestrabajadores/langs/es_ES/fichajestrabajadores.lang
```

## Compatibilidad

- Compatible con Dolibarr 20.0+
- Requiere el módulo FichajesTrabajadores instalado
- Compatible con multiempresa

## Soporte

Para soporte técnico o reportar problemas, contactar con el desarrollador del módulo. 