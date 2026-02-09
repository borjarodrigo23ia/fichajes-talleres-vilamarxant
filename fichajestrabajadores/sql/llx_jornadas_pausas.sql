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

CREATE TABLE llx_jornadas_pausas(
    -- BEGIN MODULEBUILDER FIELDS
    rowid INTEGER AUTO_INCREMENT PRIMARY KEY,
    fk_jornada INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    descripcion VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Almuerzo, Comida',
    orden INTEGER DEFAULT 0 COMMENT 'Display order',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tms TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_jornada) REFERENCES llx_jornadas_laborales(rowid) ON DELETE CASCADE
    -- END MODULEBUILDER FIELDS
) ENGINE=innodb;
