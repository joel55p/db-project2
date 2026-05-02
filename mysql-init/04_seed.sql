-- ------------------------------------------------------
-- CapGt — Tienda de Gorras en Guate
-- 04_seed.sql — Datos de prueba (25 registros por tabla)
-- Joel Nerio, 24253
-- ------------------------------------------------------

USE capgt_db;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- CATEGORIAS 
INSERT INTO CATEGORIAS (nombre, descripcion) VALUES
    ('Snapback',              'Cierre plástico ajustable, visera plana'),
    ('Fitted',                'Talla fija, copa estructurada'),
    ('Trucker',               'Frente sólido, malla posterior'),
    ('Dad Hat',               'Perfil bajo, visera curva'),
    ('Bucket Hat',            'Ala ancha estilo pescador'),
    ('Beanie',                'Gorro de punto elástico'),
    ('Visor',                 'Solo visera frontal ajustable'),
    ('Gorra Deportiva',       'Uso deportivo'),
    ('Gorra Casual',          'Uso diario'),
    ('Gorra Premium',         'Alta calidad'),
    ('Gorra Edición Especial','Coleccionables'),
    ('Gorra Urbana',          'Estilo streetwear'),
    ('Gorra Vintage',         'Diseño retro'),
    ('Gorra Minimalista',     'Diseño simple'),
    ('Gorra Logo',            'Con logotipos'),
    ('Gorra Bordada',         'Con bordado'),
    ('Gorra Ajustable Tela',  'Ajuste con tela'),
    ('Gorra Juvenil',         'Para jóvenes'),
    ('Gorra Infantil',        'Para niños'),
    ('Gorra Outdoorboy',      'Para exteriores'),
    ('Gorra Verano',          'Para clima cálido'),
    ('Gorra Invierno',        'Para frío'),
    ('Gorra Edición Limitada','Limitada'),
    ('Gorra Deportiva Pro',   'Profesional'),
    ('Gorra Running',         'Para correr');

--  PROVEEDORES 
INSERT INTO PROVEEDORES (nombre, contacto, telefono, email, pais) VALUES
    ('New Era Cap Co.',    'James Smith',   '+1-716-555-1111', 'jsmith@newera.com',       'Estados Unidos'),
    ('Nike Headwear',      'Ana López',     '+1-503-555-2222', 'alopez@nike.com',          'Estados Unidos'),
    ('Adidas Caps EMEA',   'Peter Müller',  '+49-89-555-3333', 'pmuller@adidas.de',        'Alemania'),
    ('Importaciones GT',   'Luis Pérez',    '+502-2200-4444',  'lperez@importgt.com',      'Guatemala'),
    ('Cap World México',   'María Torres',  '+52-55-555-5555', 'mtorres@capworld.mx',      'México'),
    ('Pacific Headwear',   'Tom Chen',      '+1-925-555-6666', 'tchen@pacifichw.com',      'Estados Unidos'),
    ('Cap Supply USA',     'John Doe',      '555-2001',        'contact@capsupply.com',    'Estados Unidos'),
    ('Urban Caps Co',      'Luis García',   '555-2002',        'urban@caps.com',           'México'),
    ('StreetWear Inc',     'Ana Ruiz',      '555-2003',        'info@streetwear.com',      'Colombia'),
    ('Headwear Global',    'Carlos Pérez',  '555-2004',        'sales@headwear.com',       'España'),
    ('Cap Factory',        'María López',   '555-2005',        'ventas@capfactory.com',    'Perú'),
    ('Global Caps Ltd',    'Pedro Díaz',    '555-2006',        'contact@globalcaps.com',   'Chile'),
    ('Fashion Caps',       'Laura Méndez',  '555-2007',        'fashion@caps.com',         'Argentina'),
    ('Caps World Intl',    'Miguel Torres', '555-2008',        'world@caps.com',           'Brasil'),
    ('Elite Caps',         'Jorge Ramos',   '555-2009',        'elite@caps.com',           'Canadá'),
    ('Caps Distribution',  'Sofía Vega',    '555-2010',        'dist@caps.com',            'Panamá'),
    ('Cap Trends',         'David Flores',  '555-2011',        'trends@caps.com',          'Costa Rica'),
    ('Cap Imports',        'Ricardo Luna',  '555-2012',        'imports@caps.com',         'Guatemala'),
    ('Urban Supply Caps',  'Elena Cruz',    '555-2013',        'urban2@caps.com',          'México'),
    ('Pro Caps',           'Andrés Soto',   '555-2014',        'pro@caps.com',             'Estados Unidos'),
    ('Caps Express',       'Daniel Ríos',   '555-2015',        'express@caps.com',         'España'),
    ('Caps Elite Group',   'Paola Jiménez', '555-2016',        'elitegroup@caps.com',      'Chile'),
    ('Headwear Trends',    'José Castillo', '555-2017',        'trends2@caps.com',         'Perú'),
    ('Caps Factory Pro',   'Marcos Silva',  '555-2018',        'factory@caps.com',         'Brasil'),
    ('Cap Export',         'Lucía Herrera', '555-2019',        'export@caps.com',          'Colombia');

--  EMPLEADOS 
INSERT INTO EMPLEADOS (nombre, puesto, email, telefono, fecha_contratacion, salario) VALUES
    ('Krystel Chamalej', 'Supervisor',  'kcha@capgt.com',    '5555-1001', '2021-03-15', 7500.00),
    ('Kevin Toledo',     'Vendedor',    'ktol@capgt.com',    '5555-1002', '2022-06-01', 4800.00),
    ('Jorge Doradea',    'Vendedor',    'jdora@capgt.com',   '5555-1003', '2022-08-10', 4800.00),
    ('Silvia Castillo',  'Cajero',      'scast@capgt.com',   '5555-1004', '2023-01-20', 4500.00),
    ('Valeria Enriquez', 'Bodeguero',   'venri@capgt.com',   '5555-1005', '2023-05-05', 4200.00),
    ('Marco Diaz',       'Vendedor',    'mdia@capgt.com',    '5555-1006', '2024-01-15', 4800.00),
    ('Luis Pérez',       'Vendedor',    'lperez@capgt.com',  '5555-2001', '2023-02-01', 4800.00),
    ('Ana Gómez',        'Cajero',      'agomez@capgt.com',  '5555-2002', '2023-03-01', 4500.00),
    ('Pedro Ramírez',    'Vendedor',    'pramirez@capgt.com','5555-2003', '2023-04-01', 4800.00),
    ('Carla Méndez',     'Supervisor',  'cmendez@capgt.com', '5555-2004', '2022-01-10', 7000.00),
    ('José López',       'Bodeguero',   'jlopez@capgt.com',  '5555-2005', '2023-05-01', 4200.00),
    ('Andrea Cruz',      'Vendedor',    'acruz@capgt.com',   '5555-2006', '2023-06-01', 4800.00),
    ('Mario Díaz',       'Cajero',      'mdiaz@capgt.com',   '5555-2007', '2023-07-01', 4500.00),
    ('Laura Pérez',      'Vendedor',    'lperez2@capgt.com', '5555-2008', '2023-08-01', 4800.00),
    ('Kevin Morales',    'Vendedor',    'kmorales@capgt.com','5555-2009', '2023-09-01', 4800.00),
    ('Sofía López',      'Supervisor',  'slopez2@capgt.com', '5555-2010', '2022-02-15', 7200.00),
    ('Daniel Torres',    'Bodeguero',   'dtorres@capgt.com', '5555-2011', '2023-10-01', 4200.00),
    ('Natalia Ruiz',     'Vendedor',    'nruiz@capgt.com',   '5555-2012', '2023-11-01', 4800.00),
    ('Oscar Castillo',   'Cajero',      'ocastillo@capgt.com','5555-2013','2023-12-01', 4500.00),
    ('Patricia Vega',    'Vendedor',    'pvega@capgt.com',   '5555-2014', '2024-01-01', 4800.00),
    ('Ricardo Gómez',    'Supervisor',  'rgomez@capgt.com',  '5555-2015', '2021-05-01', 7500.00),
    ('Camila Rojas',     'Vendedor',    'crojas@capgt.com',  '5555-2016', '2024-02-01', 4800.00),
    ('Diego Herrera',    'Bodeguero',   'dherrera@capgt.com','5555-2017', '2023-03-15', 4200.00),
    ('Valeria Soto',     'Vendedor',    'vsoto@capgt.com',   '5555-2018', '2023-04-20', 4800.00),
    ('Fernando Cruz',    'Cajero',      'fcruz@capgt.com',   '5555-2019', '2023-06-10', 4500.00);

--  CLIENTES 
INSERT INTO CLIENTES (nombre, email, telefono, direccion, fecha_registro) VALUES
    ('Roberto Gálvez Marín',   'rgalvez@gmail.com',    '5500-0001', '3ra Av. 5-22 Zona 1, Guatemala City',         '2023-01-10'),
    ('Sandra López Morales',   'slopez@hotmail.com',   '5500-0002', '14 Calle 4-10 Zona 10, Guatemala City',       '2023-01-15'),
    ('Miguel Reyes Ajú',       'mreyes@gmail.com',     '5500-0003', 'Col. El Milagro, Mixco',                      '2023-02-05'),
    ('Luisa Fuentes Pac',      'lfuentes@yahoo.com',   '5500-0004', 'Res. Los Alamos, Villa Nueva',                '2023-02-20'),
    ('Andrés Camposeco Tol',   'acamposeco@gmail.com', '5500-0005', '18 Av. 3-45 Zona 6, Guatemala City',          '2023-03-01'),
    ('Diana Morales Cux',      'dmorales@gmail.com',   '5500-0006', '16 Calle 10-30 Zona 15, Guatemala City',      '2023-03-18'),
    ('Héctor Ajquí Saquic',    'hajqui@hotmail.com',   '5500-0007', 'Cantón Central, San Marcos',                  '2023-04-02'),
    ('Claudia Tol Ixcoy',      'ctol@gmail.com',       '5500-0008', '5ta Calle 8-15 Zona 1, Quetzaltenango',       '2023-04-22'),
    ('Fernando Pac Xool',      'fpac@gmail.com',       '5500-0009', 'Colonia Belén, Escuintla',                    '2023-05-10'),
    ('Ingrid Xitumul Batz',    'ixitumul@yahoo.com',   '5500-0010', '6ta Av. 12-50 Zona 12, Guatemala City',       '2023-05-28'),
    ('Óscar Batz Coj',         'obatz@gmail.com',      '5500-0011', 'Barrio San Antonio, Chimaltenango',           '2023-06-15'),
    ('Verónica Ichich Tuy',    'vichich@hotmail.com',  '5500-0012', '4ta Av. 2-10, Cobán, Alta Verapaz',           '2023-06-30'),
    ('Julio Cuc Saquec',       'jcuc@gmail.com',       '5500-0013', 'Barrio La Libertad, Flores, Petén',           '2023-07-08'),
    ('Patricia Samayoa Cruz',  'psamayoa@gmail.com',   '5500-0014', '7ma Av. 15-20 Zona 7, Guatemala City',        '2023-07-22'),
    ('Emilio Tzay Ixcoy',      'etzay@yahoo.com',      '5500-0015', 'Col. Minerva, Huehuetenango',                 '2023-08-03'),
    ('Karla Mejía Sipac',      'kmejia@gmail.com',     '5500-0016', '12 Calle 3-30 Zona 4, Guatemala City',        '2023-08-19'),
    ('Rodrigo Boj Ajquí',      'rboj@hotmail.com',     '5500-0017', 'Barrio San Sebastián, Jalapa',                '2023-09-01'),
    ('Yolanda Xicol Pac',      'yxicol@gmail.com',     '5500-0018', 'Cantón Xolajuj, Totonicapán',                 '2023-09-15'),
    ('David Sajbín Morales',   'dsajbin@gmail.com',    '5500-0019', 'Col. Los Cerezos, Retalhuleu',                '2023-10-02'),
    ('Lorena Tzul Gálvez',     'ltzul@yahoo.com',      '5500-0020', '9na Av. 6-15 Zona 2, Guatemala City',         '2023-10-20'),
    ('Armando Catú Reyes',     'acatu@gmail.com',      '5500-0021', 'Barrio San Pedro, Mazatenango, Suchitepéquez','2023-11-05'),
    ('Beatriz Pú Boj',         'bpu@hotmail.com',      '5500-0022', '5ta Calle 8-40 Zona 9, Guatemala City',       '2023-11-18'),
    ('Cristian Mux Tol',       'cmux@gmail.com',       '5500-0023', 'Col. Gualán, Santa Rosa',                     '2023-12-01'),
    ('Elena Caal Tzay',        'ecaal@gmail.com',      '5500-0024', 'Barrio La Playa, Livingston, Izabal',          '2023-12-15'),
    ('Francisco Saquil López', 'fsaquil@yahoo.com',    '5500-0025', '10ma Av. 2-05 Zona 11, Guatemala City',       '2024-01-10');

-- PRODUCTOS 
INSERT INTO PRODUCTOS (categoria_id, proveedor_id, nombre, marca, talla, color, precio_compra, precio_venta, stock, stock_minimo) VALUES
    (1, 1, 'NY Yankees 9Fifty Snapback',     'New Era',   'Única', 'Azul marino / Blanco',  85.00, 150.00, 30,  5),
    (1, 1, 'LA Dodgers Classic Snapback',    'New Era',   'Única', 'Azul real / Blanco',    75.00, 135.00, 25,  5),
    (1, 2, 'Nike Dri-FIT Aerobill Snapback', 'Nike',      'Única', 'Negro',                 65.00, 120.00, 40,  8),
    (1, 3, 'Adidas Originals Snapback',      'Adidas',    'Única', 'Blanco / Negro',        60.00, 110.00, 35,  8),
    (1, 5, 'CapGt Flag Guatemala Snapback',  'Cap World', 'Única', 'Azul celeste / Blanco', 55.00, 105.00, 45,  8),
    (2, 1, 'New Era 59Fifty Navy Fitted',    'New Era',   '7 1/4', 'Azul marino',           90.00, 160.00, 20,  5),
    (2, 1, 'Chicago Bulls 59Fifty Fitted',   'New Era',   '7 3/8', 'Negro / Rojo',          95.00, 170.00, 15,  5),
    (2, 1, 'Houston Astros 59Fifty Fitted',  'New Era',   '7 5/8', 'Naranja / Negro',       95.00, 175.00, 12,  5),
    (2, 4, 'CapGt Custom Fitted Verde',      'CapGt',     'L',     'Verde olivo',           45.00,  90.00, 50, 10),
    (3, 6, 'Pacific Trucker Mesh Clásica',   'Pacific',   'Única', 'Café / Beige malla',    40.00,  80.00, 60, 10),
    (3, 5, 'Cap World Trucker Roja',         'Cap World', 'Única', 'Rojo / Blanco malla',   38.00,  75.00, 55, 10),
    (3, 2, 'Nike Aerobill Trucker',          'Nike',      'Única', 'Gris / Negro malla',    70.00, 130.00, 30,  8),
    (3, 6, 'Pacific Farm Trucker Verde',     'Pacific',   'Única', 'Verde / Blanco malla',  38.00,  75.00, 65, 10),
    (4, 1, 'New Era Dad Hat Canvas',         'New Era',   'Única', 'Caqui',                 50.00,  95.00, 45,  8),
    (4, 4, 'CapGt Dad Hat Rosa',             'CapGt',     'Única', 'Rosa pastel',           35.00,  70.00, 60, 10),
    (4, 5, 'Cap World Low Profile Gris',     'Cap World', 'Única', 'Gris claro',            33.00,  65.00, 50, 10),
    (4, 5, 'Cap World Canvas Marrón',        'Cap World', 'Única', 'Marrón',                36.00,  72.00, 48,  8),
    (5, 3, 'Adidas Bucket Hat Negro',        'Adidas',    'M',     'Negro',                 55.00, 100.00, 25,  5),
    (5, 2, 'Nike ACG Bucket Hat Verde',      'Nike',      'L',     'Verde bosque',          60.00, 115.00, 20,  5),
    (5, 6, 'Pacific Bucket Azul Cielo',      'Pacific',   'Única', 'Azul cielo',            42.00,  85.00, 30,  5),
    (6, 4, 'CapGt Beanie Invierno Negro',    'CapGt',     'Única', 'Negro',                 28.00,  60.00, 80, 15),
    (6, 4, 'CapGt Beanie Rayado Multicolor', 'CapGt',     'Única', 'Multicolor',            30.00,  65.00, 70, 15),
    (6, 3, 'Adidas Beanie Logo Rojo',        'Adidas',    'Única', 'Rojo',                  40.00,  80.00, 40, 10),
    (7, 2, 'Nike Visor Running Blanco',      'Nike',      'Única', 'Blanco',                45.00,  90.00, 35,  8),
    (7, 3, 'Adidas Visor Tennis Azul',       'Adidas',    'Única', 'Azul',                  42.00,  85.00, 30,  8);

--  VENTAS 
INSERT INTO VENTAS (cliente_id, empleado_id, fecha_venta, total, metodo_pago, estado) VALUES
    ( 1, 2, '2024-01-05 10:30:00',  285.00, 'Tarjeta',       'completada'),
    ( 2, 3, '2024-01-08 14:15:00',  150.00, 'Efectivo',      'completada'),
    ( 3, 2, '2024-01-12 09:00:00',  320.00, 'Transferencia', 'completada'),
    ( 4, 4, '2024-01-18 16:45:00',   95.00, 'Efectivo',      'completada'),
    ( 5, 3, '2024-01-25 11:20:00',  240.00, 'Tarjeta',       'completada'),
    ( 6, 2, '2024-02-02 13:00:00',  175.00, 'Efectivo',      'completada'),
    ( 7, 3, '2024-02-09 10:10:00',  430.00, 'Tarjeta',       'completada'),
    ( 8, 4, '2024-02-14 15:30:00',  130.00, 'Efectivo',      'completada'),
    ( 9, 2, '2024-02-20 09:45:00',  360.00, 'Transferencia', 'completada'),
    (10, 3, '2024-02-28 12:00:00',  200.00, 'Tarjeta',       'completada'),
    (11, 2, '2024-03-05 10:00:00',  150.00, 'Efectivo',      'completada'),
    (12, 4, '2024-03-10 14:30:00',  260.00, 'Tarjeta',       'completada'),
    (13, 3, '2024-03-15 11:15:00',   80.00, 'Efectivo',      'anulada'),
    (14, 2, '2024-03-22 16:00:00',  315.00, 'Transferencia', 'completada'),
    (15, 4, '2024-04-01 09:30:00',  185.00, 'Tarjeta',       'completada'),
    (16, 3, '2024-04-08 13:45:00',  480.00, 'Tarjeta',       'completada'),
    (17, 2, '2024-04-15 10:20:00',  120.00, 'Efectivo',      'completada'),
    (18, 4, '2024-04-22 15:00:00',  340.00, 'Transferencia', 'completada'),
    (19, 3, '2024-05-03 11:00:00',  225.00, 'Tarjeta',       'completada'),
    (20, 6, '2024-05-10 14:00:00',  160.00, 'Efectivo',      'completada'),
    (21, 4, '2024-05-18 09:15:00',  395.00, 'Tarjeta',       'completada'),
    (22, 3, '2024-05-25 12:30:00',  285.00, 'Transferencia', 'completada'),
    (23, 6, '2024-06-02 10:45:00',  145.00, 'Efectivo',      'completada'),
    (24, 4, '2024-06-10 15:15:00',  520.00, 'Tarjeta',       'completada'),
    (25, 3, '2024-06-18 11:30:00',  210.00, 'Tarjeta',       'completada');

-- DETALLE_VENTAS 
INSERT INTO DETALLE_VENTAS (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
    -- Venta 1: Roberto Gálvez — 3 productos
    (1,  1, 1, 150.00, 150.00),
    (1,  3, 1, 120.00, 120.00),
    (1, 14, 1,  95.00,  95.00),
    -- Venta 2: Sandra López — 1 producto
    (2,  2, 1, 150.00, 150.00),
    -- Venta 3: Miguel Reyes — 2 productos
    (3,  6, 1, 160.00, 160.00),
    (3,  7, 1, 170.00, 170.00),
    -- Venta 4: Luisa Fuentes — 1 producto
    (4, 14, 1,  95.00,  95.00),
    -- Venta 5: Andrés Camposeco — 2 unidades mismo producto
    (5,  3, 2, 120.00, 240.00),
    -- Venta 6: Diana Morales — 2 productos
    (6,  4, 1, 110.00, 110.00),
    (6, 16, 1,  65.00,  65.00),
    -- Venta 7: Héctor Ajquí — 4 productos
    (7,  1, 1, 150.00, 150.00),
    (7,  6, 1, 160.00, 160.00),
    (7, 23, 1,  80.00,  80.00),
    (7, 15, 1,  70.00,  70.00),
    -- Venta 8: Claudia Tol — 2 beanies
    (8, 22, 2,  65.00, 130.00),
    -- Venta 9: Fernando Pac — 2 productos
    (9,  7, 1, 170.00, 170.00),
    (9,  2, 1, 135.00, 135.00),
    -- Venta 10: Ingrid Xitumul — 2 productos
    (10, 24, 1,  90.00,  90.00),
    (10, 12, 1, 130.00, 130.00),
    -- Venta 11: Óscar Batz — 2 beanies
    (11, 21, 2,  60.00, 120.00),
    -- Venta 12: Verónica Ichich — 2 productos
    (12,  1, 1, 150.00, 150.00),
    (12, 18, 1, 100.00, 100.00),
    -- Venta 13: Julio Cuc — anulada
    (13, 10, 1,  80.00,  80.00),
    -- Venta 14: Patricia Samayoa — 2 productos
    (14,  8, 1, 175.00, 175.00),
    (14,  4, 1, 110.00, 110.00),
    -- Venta 15: Emilio Tzay — 2 productos
    (15, 19, 1, 115.00, 115.00),
    (15, 16, 1,  65.00,  65.00),
    -- Venta 16: Karla Mejía — 4 productos
    (16,  1, 1, 150.00, 150.00),
    (16,  7, 1, 170.00, 170.00),
    (16, 12, 1, 130.00, 130.00),
    (16, 24, 1,  90.00,  90.00),
    -- Venta 17: Rodrigo Boj — 1 producto
    (17, 21, 2,  60.00, 120.00),
    -- Venta 18: Yolanda Xicol — 2 productos
    (18,  9, 1,  90.00,  90.00),
    (18,  6, 1, 160.00, 160.00),
    -- Venta 19: David Sajbín — 2 productos
    (19,  5, 1, 105.00, 105.00),
    (19, 20, 1,  85.00,  85.00),
    -- Venta 20: Lorena Tzul — 2 dad hats
    (20, 15, 1,  70.00,  70.00),
    (20, 17, 1,  72.00,  72.00),
    -- Venta 21: Armando Catú — 3 productos
    (21,  8, 1, 175.00, 175.00),
    (21, 23, 1,  80.00,  80.00),
    (21,  1, 1, 150.00, 150.00),
    -- Venta 22: Beatriz Pú — 2 productos
    (22,  6, 1, 160.00, 160.00),
    (22, 14, 1,  95.00,  95.00),
    -- Venta 23: Cristian Mux — 2 beanies
    (23, 22, 2,  65.00, 130.00),
    -- Venta 24: Elena Caal — 3 productos
    (24,  7, 1, 170.00, 170.00),
    (24,  2, 1, 135.00, 135.00),
    (24, 19, 1, 115.00, 115.00),
    -- Venta 25: Francisco Saquil — 2 productos
    (25, 12, 1, 130.00, 130.00),
    (25, 11, 1,  75.00,  75.00);

-- ── USUARIOS (admin para pruebas) ────────────────────────────
-- password: admin123  (bcrypt hash generado offline)
INSERT INTO USUARIOS (username, password, rol, empleado_id) VALUES
    ('admin', '$2b$10$TqElIdXcxYEMoZhmmS9CqOQ2HI9NxIVJ6Rk5aHtyUyfrJJy28wI9m', 'admin', 1);
