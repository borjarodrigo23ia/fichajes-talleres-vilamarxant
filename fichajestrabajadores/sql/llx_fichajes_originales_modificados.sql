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

-- Tabla de snapshots de jornadas completas antes de su modificación
CREATE TABLE llx_fichajes_originales_modificados (
    rowid INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_jornada INTEGER NOT NULL,
    -- Snapshot de la jornada original
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NOT NULL,
    total_pausa TIME DEFAULT '00:00:00',
    total_trabajo TIME NOT NULL,
    observaciones TEXT DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT NULL,
    tms TIMESTAMP NULL DEFAULT NULL,
    active INTEGER DEFAULT 1 NOT NULL,
    ultimo_editor INTEGER DEFAULT NULL,
    ultima_modificacion DATETIME DEFAULT NULL,
    -- Metadatos de la modificación
    modificado_por INTEGER NOT NULL,
    comentario_modificacion TEXT NOT NULL,
    modificado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revision INTEGER NOT NULL DEFAULT 1,
    entity INTEGER DEFAULT 1,
    -- Índices y claves foráneas
    INDEX idx_fom_id_jornada (id_jornada),
    INDEX idx_fom_modificado_en (modificado_en),
    INDEX idx_fom_modificado_por (modificado_por),
    INDEX idx_fom_entity (entity),
    -- Nota: No usamos FK a llx_jornadas_completas para preservar el histórico
    -- incluso cuando se elimina la jornada. Conservamos el índice para búsquedas.
    CONSTRAINT fk_fom_usuario FOREIGN KEY (usuario_id) REFERENCES llx_user(rowid) ON DELETE CASCADE,
    CONSTRAINT fk_fom_modificador FOREIGN KEY (modificado_por) REFERENCES llx_user(rowid) ON DELETE RESTRICT
) ENGINE=innodb;


