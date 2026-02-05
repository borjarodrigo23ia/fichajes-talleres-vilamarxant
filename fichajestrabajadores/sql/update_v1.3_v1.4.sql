-- Copyright (C) 2024
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see http://www.gnu.org/licenses/.

-- Script para actualizar de la versión 1.3 a la 1.4
-- Añade columnas para seguimiento de modificaciones en jornadas completas

-- Añadir columna para registrar el último editor y la fecha de modificación
ALTER TABLE llx_jornadas_completas ADD COLUMN ultimo_editor INTEGER NULL AFTER active;
ALTER TABLE llx_jornadas_completas ADD COLUMN ultima_modificacion DATETIME NULL AFTER ultimo_editor;
ALTER TABLE llx_jornadas_completas ADD INDEX idx_jornadas_completas_ultimo_editor (ultimo_editor);

-- Actualizar el formato de almacenamiento de fechas para usar DATETIME en lugar de TIMESTAMP
-- DATETIME almacena exactamente la fecha/hora sin aplicar conversiones de zona horaria al guardar/recuperar

-- Actualizar los valores existentes para reflejar la hora local correctamente
UPDATE llx_jornadas_completas SET ultima_modificacion = CONVERT_TZ(ultima_modificacion, '+00:00', @@session.time_zone) WHERE ultima_modificacion IS NOT NULL;

-- Agregar restricción de clave foránea para último editor
ALTER TABLE llx_jornadas_completas ADD CONSTRAINT fk_jornadas_completas_editor FOREIGN KEY (ultimo_editor) REFERENCES llx_user(rowid) ON DELETE SET NULL; 