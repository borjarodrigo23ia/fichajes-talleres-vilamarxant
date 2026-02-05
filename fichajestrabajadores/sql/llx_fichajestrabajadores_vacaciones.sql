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
-- along with this program.  If not, see https://www.gnu.org/licenses/.

-- Table for storing vacation requests
CREATE TABLE llx_fichajestrabajadores_vacaciones (
    rowid integer AUTO_INCREMENT PRIMARY KEY,
    usuario varchar(255) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado varchar(50) NOT NULL DEFAULT 'pendiente',
    comentarios text,
    aprobado_por varchar(255),
    fecha_aprobacion datetime,
    fecha_creacion datetime NOT NULL,
    entity integer DEFAULT 1
) ENGINE=innodb;

-- Indexes
CREATE INDEX idx_fichajestrabajadores_vacaciones_usuario ON llx_fichajestrabajadores_vacaciones(usuario);
CREATE INDEX idx_fichajestrabajadores_vacaciones_estado ON llx_fichajestrabajadores_vacaciones(estado);
CREATE INDEX idx_fichajestrabajadores_vacaciones_fecha_inicio ON llx_fichajestrabajadores_vacaciones(fecha_inicio);
CREATE INDEX idx_fichajestrabajadores_vacaciones_fecha_fin ON llx_fichajestrabajadores_vacaciones(fecha_fin);
CREATE INDEX idx_fichajestrabajadores_vacaciones_entity ON llx_fichajestrabajadores_vacaciones(entity); 