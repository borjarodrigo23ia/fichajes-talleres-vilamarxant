-- Actualización 1.5 -> 1.6
-- Objetivo: conservar el histórico de snapshots aunque se elimine la jornada
-- Acción: eliminar la FK con ON DELETE CASCADE sobre llx_fichajes_originales_modificados

ALTER TABLE llx_fichajes_originales_modificados
  DROP FOREIGN KEY fk_fom_jornada;

-- (Opcional) Asegurar índice por si no existiera
-- El índice idx_fom_id_jornada ya existe desde la creación; se mantiene.


