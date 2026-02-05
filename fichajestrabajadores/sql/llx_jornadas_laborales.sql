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

CREATE TABLE llx_jornadas_laborales(
    -- BEGIN MODULEBUILDER FIELDS
    rowid INTEGER AUTO_INCREMENT PRIMARY KEY,
    fk_user INTEGER NOT NULL,
    tipo_jornada VARCHAR(20) NOT NULL COMMENT 'intensiva o partida',
    tipo_turno VARCHAR(20) NOT NULL COMMENT 'fijo o rotativo',
    hora_inicio_jornada TIME NOT NULL,
    hora_inicio_pausa TIME NULL,
    hora_fin_pausa TIME NULL,
    hora_fin_jornada TIME NOT NULL,
    observaciones TEXT DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tms TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1 NOT NULL
    -- END MODULEBUILDER FIELDS
) ENGINE=innodb; 