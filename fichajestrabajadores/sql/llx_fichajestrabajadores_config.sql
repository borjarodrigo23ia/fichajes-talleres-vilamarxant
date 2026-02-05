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

CREATE TABLE llx_fichajestrabajadores_config(
    -- BEGIN MODULEBUILDER FIELDS
    rowid INTEGER AUTO_INCREMENT PRIMARY KEY,
    param_name VARCHAR(50) NOT NULL UNIQUE,
    param_value VARCHAR(255) NOT NULL,
    entity INTEGER DEFAULT 1 NOT NULL,
    date_creation DATETIME NOT NULL,
    tms TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fk_user_creat INTEGER NOT NULL,
    fk_user_modif INTEGER,
    active INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT fk_fichajestrabajadores_config_user_creat FOREIGN KEY (fk_user_creat) REFERENCES llx_user(rowid) ON DELETE RESTRICT,
    CONSTRAINT fk_fichajestrabajadores_config_user_modif FOREIGN KEY (fk_user_modif) REFERENCES llx_user(rowid) ON DELETE SET NULL
    -- END MODULEBUILDER FIELDS
) ENGINE=innodb; 