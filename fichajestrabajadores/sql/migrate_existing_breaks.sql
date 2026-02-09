-- Migration script to move existing single breaks to the new pausas table
-- This preserves backward compatibility with existing shifts

INSERT INTO llx_jornadas_pausas (fk_jornada, hora_inicio, hora_fin, descripcion, orden)
SELECT rowid, hora_inicio_pausa, hora_fin_pausa, 'Pausa', 0
FROM llx_jornadas_laborales
WHERE hora_inicio_pausa IS NOT NULL AND hora_fin_pausa IS NOT NULL;

-- Optional: Remove old columns after migration is verified
-- ALTER TABLE llx_jornadas_laborales DROP COLUMN hora_inicio_pausa;
-- ALTER TABLE llx_jornadas_laborales DROP COLUMN hora_fin_pausa;
