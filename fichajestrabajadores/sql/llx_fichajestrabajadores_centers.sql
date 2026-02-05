CREATE TABLE llx_fichajestrabajadores_centers (
    rowid integer AUTO_INCREMENT PRIMARY KEY,
    label varchar(128) NOT NULL,
    latitude double(24,8) NOT NULL,
    longitude double(24,8) NOT NULL,
    radius integer DEFAULT 100,
    tms timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=innodb;
