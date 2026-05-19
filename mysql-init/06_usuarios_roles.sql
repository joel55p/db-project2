-- CapGt 
-- Un usuario de prueba por cada rol
-- Joel Nerio, 24253
-- --------------------------------------------------------------
-- Todos tienen  una password: "secret123" (hash bcrypt generado)
-- El admin ya existe del seed del anterior proyecto 2 (admin/admin123)
-- ---------------------------------------------------------------

USE capgt_db;
SET NAMES utf8mb4; -- para soportar caracteres especiales en los nombres de usuario

-- Actualizar la tabla USUARIOS para incluir el campo rol que realmente ya existía del proyecto 2, solo se agrego los nuevos usuarios

-- password para todos: secret123 y el hash bcrypt generado es: $2b$10$Bhrr1yLqNnrcrMkBG1QUtuRyRjWkJa9VRxWVXBzHj1PEwvRAdGgCa

INSERT INTO USUARIOS (username, password, rol, empleado_id) VALUES
  ('supervisor1', '$2b$10$Bhrr1yLqNnrcrMkBG1QUtuRyRjWkJa9VRxWVXBzHj1PEwvRAdGgCa', 'supervisor', 10),
  ('vendedor1',   '$2b$10$Bhrr1yLqNnrcrMkBG1QUtuRyRjWkJa9VRxWVXBzHj1PEwvRAdGgCa', 'vendedor',    2),
  ('cajero1',     '$2b$10$Bhrr1yLqNnrcrMkBG1QUtuRyRjWkJa9VRxWVXBzHj1PEwvRAdGgCa', 'cajero',      4),
  ('bodeguero1',  '$2b$10$Bhrr1yLqNnrcrMkBG1QUtuRyRjWkJa9VRxWVXBzHj1PEwvRAdGgCa', 'bodeguero',   5);