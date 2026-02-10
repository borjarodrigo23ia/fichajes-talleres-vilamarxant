-- Update script for legal compliance: Add IP/UA tracking to audit logs
-- Run this on production database

-- Add IP address column to fichajes_log
ALTER TABLE llx_fichajes_log ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL;

-- Add User-Agent column to fichajes_log  
ALTER TABLE llx_fichajes_log ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT NULL;

-- Add integrity hash column to fichajestrabajadores for tamper detection
ALTER TABLE llx_fichajestrabajadores ADD COLUMN IF NOT EXISTS hash_integridad VARCHAR(64) DEFAULT NULL;

-- Update corrections table (from previous session)
ALTER TABLE llx_fichajestrabajadores_corrections ADD COLUMN IF NOT EXISTS fk_approver INTEGER NULL;
ALTER TABLE llx_fichajestrabajadores_corrections ADD COLUMN IF NOT EXISTS date_approval DATETIME NULL;
ALTER TABLE llx_fichajestrabajadores_corrections ADD COLUMN IF NOT EXISTS date_creation DATETIME NULL;
