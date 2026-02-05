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

-- Modificar la tabla de fichajes para añadir el ID de usuario
ALTER TABLE llx_fichajestrabajadores ADD COLUMN fk_user INTEGER NULL AFTER rowid;

-- Actualizar los registros existentes utilizando el campo usuario
UPDATE llx_fichajestrabajadores f
JOIN llx_user u ON f.usuario = u.login
SET f.fk_user = u.rowid;

-- Crear las nuevas tablas
CREATE TABLE IF NOT EXISTS llx_jornadas_completas(
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
) ENGINE=innodb;

CREATE TABLE IF NOT EXISTS llx_fichajes_log(
    id_log INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_fichaje INTEGER DEFAULT NULL,
    id_jornada INTEGER DEFAULT NULL,
    usuario_editor INTEGER NOT NULL,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    comentario TEXT NOT NULL,
    CONSTRAINT fk_fichajes_log_fichaje FOREIGN KEY (id_fichaje) REFERENCES llx_fichajestrabajadores(rowid) ON DELETE CASCADE,
    CONSTRAINT fk_fichajes_log_jornada FOREIGN KEY (id_jornada) REFERENCES llx_jornadas_completas(id_jornada) ON DELETE CASCADE,
    CONSTRAINT fk_fichajes_log_usuario FOREIGN KEY (usuario_editor) REFERENCES llx_user(rowid) ON DELETE CASCADE
) ENGINE=innodb; 