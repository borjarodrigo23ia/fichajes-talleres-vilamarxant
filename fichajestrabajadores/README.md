# Módulo FichajesTrabajadores para Dolibarr

## Descripción
Este módulo permite el registro de fichajes de trabajadores en Dolibarr de forma sencilla e intuitiva.

## Características
- Interfaz de usuario simple con dos botones: "Entrar" y "Salir"
- Registro de entrada y salida de trabajadores
- Visualización del listado de fichajes
- API REST para integración con sistemas externos

## Instalación
1. Copiar el directorio `fichajestrabajadores` en la carpeta `htdocs/custom/` de la instalación de Dolibarr
2. Acceder a Dolibarr > Inicio > Configuración > Módulos
3. Buscar el módulo "FichajesTrabajadores" en la sección "RR.HH." y activarlo

## Uso
1. Acceder al menú "FichajesTrabajadores" desde el menú principal
2. Para registrar una entrada, hacer clic en el botón "Entrar"
3. Para registrar una salida, hacer clic en el botón "Salir"
4. El listado muestra todos los fichajes registrados

## API REST
El módulo incluye una API REST que permite:
- Consultar todos los fichajes mediante una petición GET
- Registrar entradas mediante una petición POST
- Registrar salidas mediante una petición POST

### Endpoints disponibles

#### 1. Obtener todos los fichajes
- **Método**: GET
- **URL**: `/custom/fichajestrabajadores/api/fichajes.php`

#### 2. Registrar una entrada
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/registrarEntrada.php`

#### 3. Registrar una salida
- **Método**: POST
- **URL**: `/custom/fichajestrabajadores/api/registrarSalida.php`

Para más detalles sobre el uso de la API, consultar el archivo `/api/README.md`.

## Estructura de la base de datos
El módulo crea una tabla `llx_fichajestrabajadores` con los siguientes campos:
- `rowid`: ID único del registro
- `usuario`: Nombre del usuario (por defecto "USUARIO")
- `tipo`: Tipo de fichaje ("entrar" o "salir")
- `fecha_creacion`: Fecha y hora del fichaje

## Requisitos
- Dolibarr >= 14.0

## Licencia
Este módulo se distribuye bajo la licencia GNU/GPL v3. 