-- Actualización v2.5 -> v2.6: crea tabla de configuración de usuario si no existe

CREATE TABLE IF NOT EXISTS llx_fichajestrabajadores_user_config(
    rowid INTEGER AUTO_INCREMENT PRIMARY KEY,
    fk_user INTEGER NOT NULL,
    param_name VARCHAR(50) NOT NULL,
    param_value VARCHAR(255) NOT NULL,
    entity INTEGER DEFAULT 1 NOT NULL,
    tms TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_fichajestrabajadores_user_config (fk_user, param_name, entity)
) ENGINE=innodb;
