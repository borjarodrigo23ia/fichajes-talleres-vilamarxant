-- Update script for legal compliance: Worker Validation of Admin Changes
-- Run this on production database

-- Add status column for worker acceptance
-- Default is 'aceptado' for normal clock-ins
-- Admin edits will be inserted as 'pendiente'
ALTER TABLE llx_fichajestrabajadores ADD COLUMN IF NOT EXISTS estado_aceptacion VARCHAR(20) DEFAULT 'aceptado';
