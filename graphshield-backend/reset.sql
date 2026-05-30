DELETE FROM alert;
DELETE FROM attack_session;
DELETE FROM edge;
DELETE FROM node;
ALTER SEQUENCE node_node_id_seq RESTART WITH 1;
ALTER SEQUENCE edge_edge_id_seq RESTART WITH 1;

-- =============================================
-- TECHCORP ENTERPRISE NETWORK SIMULATION
-- =============================================

INSERT INTO node (node_name, node_type, ip_address, risk_level, network_id) VALUES

-- PERIMETER (3 nodes)
('Internet Gateway',        'ROUTER',      '203.0.113.1',  20, 1),
('Perimeter Firewall',      'FIREWALL',    '203.0.113.2',  15, 1),
('VPN Gateway',             'ROUTER',      '203.0.113.3',  45, 1),

-- DMZ ZONE (4 nodes)
('Web Server',              'SERVER',      '10.10.1.1',    50, 1),
('Mail Server',             'SERVER',      '10.10.1.2',    55, 1),
('API Gateway',             'SERVER',      '10.10.1.3',    60, 1),
('Load Balancer',           'ROUTER',      '10.10.1.4',    35, 1),

-- INTERNAL NETWORK (4 nodes)
('Internal Firewall',       'FIREWALL',    '10.20.0.1',    20, 1),
('App Server',              'SERVER',      '10.20.1.1',    55, 1),
('Auth Server',             'SERVER',      '10.20.1.2',    75, 1),
('Internal DNS Server',     'SERVER',      '10.20.1.3',    50, 1),

-- DATABASES (4 nodes)
('Customer Database',       'DATABASE',    '10.30.1.1',    80, 1),
('Employee Database',       'DATABASE',    '10.30.1.2',    85, 1),
('Finance Database',        'DATABASE',    '10.30.1.3',    95, 1),
('Backup Server',           'SERVER',      '10.30.1.4',    70, 1),

-- SENSITIVE SYSTEMS (4 nodes)
('Finance Server',          'SERVER',      '10.40.1.1',    90, 1),
('HR Server',               'SERVER',      '10.40.1.2',    85, 1),
('CEO Workstation',         'ADMIN',       '10.40.1.3',    92, 1),
('IT Admin System',         'ADMIN',       '10.40.1.4',    88, 1),

-- EMPLOYEE ZONE (3 nodes)
('Dev Workstation',         'WORKSTATION', '10.50.1.1',    60, 1),
('Employee PC 1',           'WORKSTATION', '10.50.1.2',    55, 1),
('Employee PC 2',           'WORKSTATION', '10.50.1.3',    55, 1);

-- =============================================
-- CONNECTIONS
-- =============================================

INSERT INTO edge (source_id, target_id, weight, exploit_diff, network_id) VALUES

-- Internet → Perimeter
(1, 2, 0.5, 9, 1),   -- Gateway → Firewall
(1, 3, 0.4, 6, 1),   -- Gateway → VPN

-- Perimeter → DMZ
(2, 4, 0.3, 4, 1),   -- Firewall → Web Server
(2, 5, 0.4, 5, 1),   -- Firewall → Mail Server
(2, 7, 0.3, 4, 1),   -- Firewall → Load Balancer
(3, 8, 0.4, 5, 1),   -- VPN → Internal Firewall

-- DMZ Internal
(7, 4, 0.2, 2, 1),   -- Load Balancer → Web Server
(7, 6, 0.2, 2, 1),   -- Load Balancer → API Gateway
(4, 6, 0.3, 3, 1),   -- Web Server → API Gateway
(6, 9, 0.4, 4, 1),   -- API Gateway → App Server
(5, 10, 0.4, 4, 1),  -- Mail Server → Auth Server

-- DMZ → Internal
(4, 8, 0.4, 5, 1),   -- Web Server → Internal Firewall
(6, 8, 0.4, 5, 1),   -- API Gateway → Internal Firewall

-- Internal Network
(8, 9,  0.3, 4, 1),  -- Internal FW → App Server
(8, 10, 0.4, 5, 1),  -- Internal FW → Auth Server
(8, 11, 0.3, 3, 1),  -- Internal FW → DNS Server
(9, 12, 0.5, 5, 1),  -- App Server → Customer DB
(9, 10, 0.3, 3, 1),  -- App Server → Auth Server
(10, 12, 0.4, 4, 1), -- Auth Server → Customer DB
(10, 13, 0.5, 5, 1), -- Auth Server → Employee DB
(11, 9, 0.3, 3, 1),  -- DNS → App Server

-- Databases
(12, 15, 0.4, 5, 1), -- Customer DB → Backup
(13, 15, 0.3, 4, 1), -- Employee DB → Backup
(14, 15, 0.3, 4, 1), -- Finance DB → Backup
(12, 13, 0.4, 4, 1), -- Customer DB → Employee DB

-- Sensitive Systems
(8, 16,  0.5, 7, 1), -- Internal FW → Finance Server
(8, 17,  0.5, 7, 1), -- Internal FW → HR Server
(16, 14, 0.3, 4, 1), -- Finance Server → Finance DB
(17, 13, 0.3, 4, 1), -- HR Server → Employee DB
(16, 18, 0.2, 3, 1), -- Finance Server → CEO Workstation
(17, 19, 0.3, 4, 1), -- HR Server → IT Admin
(18, 14, 0.2, 2, 1), -- CEO Workstation → Finance DB
(19, 16, 0.2, 2, 1), -- IT Admin → Finance Server
(19, 14, 0.2, 2, 1), -- IT Admin → Finance DB

-- Employee Zone
(20, 9,  0.3, 3, 1), -- Dev WS → App Server
(20, 8,  0.4, 4, 1), -- Dev WS → Internal FW 
(21, 4,  0.2, 2, 1), -- Employee PC1 → Web Server 
(22, 4,  0.2, 2, 1), -- Employee PC2 → Web Server
(21, 9,  0.3, 3, 1), -- Employee PC1 → App Server
(3,  20, 0.3, 3, 1), -- VPN → Dev Workstation
(5,  21, 0.3, 3, 1); -- Mail Server → Employee PC1 (phishing!)