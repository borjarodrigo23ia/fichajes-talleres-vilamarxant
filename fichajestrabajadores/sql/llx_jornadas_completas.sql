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

CREATE TABLE llx_jornadas_completas(
    -- BEGIN MODULEBUILDER FIELDS
    id_jornada INTEGER AUTO_INCREMENT PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NOT NULL,
    total_pausa TIME DEFAULT '00:00:00',
    total_trabajo TIME NOT NULL,
    observaciones TEXT DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tms TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT fk_jornadas_completas_usuario FOREIGN KEY (usuario_id) REFERENCES llx_user(rowid) ON DELETE CASCADE
    -- END MODULEBUILDER FIELDS
) ENGINE=innodb; 