-- Actualización v1.4 -> v1.5: crea tabla de días de vacaciones por usuario/año

CREATE TABLE IF NOT EXISTS llx_fichajestrabajadores_vacaciones_dias (
    rowid integer AUTO_INCREMENT PRIMARY KEY,
    fk_user integer NOT NULL,
    anio smallint NOT NULL,
    dias integer NOT NULL DEFAULT 0,
    datec datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tms timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    entity integer DEFAULT 1
) ENGINE=innodb;

CREATE UNIQUE INDEX IF NOT EXISTS ux_ft_vac_dias_user_year_entity ON llx_fichajestrabajadores_vacaciones_dias (fk_user, anio, entity);
CREATE INDEX IF NOT EXISTS idx_ft_vac_dias_user ON llx_fichajestrabajadores_vacaciones_dias (fk_user);
CREATE INDEX IF NOT EXISTS idx_ft_vac_dias_anio ON llx_fichajestrabajadores_vacaciones_dias (anio);
CREATE INDEX IF NOT EXISTS idx_ft_vac_dias_entity ON llx_fichajestrabajadores_vacaciones_dias (entity);

