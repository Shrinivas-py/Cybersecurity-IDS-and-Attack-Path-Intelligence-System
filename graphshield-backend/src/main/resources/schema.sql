
DROP TABLE IF EXISTS remediation_action CASCADE;
DROP TABLE IF EXISTS alert CASCADE;
DROP TABLE IF EXISTS attack_path CASCADE;
DROP TABLE IF EXISTS attack_session CASCADE;
DROP TABLE IF EXISTS edge CASCADE;
DROP TABLE IF EXISTS node CASCADE;
CREATE TABLE node (
    node_id        SERIAL PRIMARY KEY,
    node_name      VARCHAR(100) NOT NULL,
    node_type      VARCHAR(50)  NOT NULL
                   CHECK (node_type IN (
                       'SERVER','ROUTER','FIREWALL',
                       'DATABASE','WORKSTATION','ADMIN'
                   )),
    ip_address     VARCHAR(50),
    risk_level     INTEGER DEFAULT 0
                   CHECK (risk_level BETWEEN 0 AND 100),
    is_compromised BOOLEAN DEFAULT FALSE,
    network_id     INTEGER NOT NULL DEFAULT 1
);

-- TABLE 2: EDGE
CREATE TABLE edge (
    edge_id      SERIAL PRIMARY KEY,
    source_id    INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
    target_id    INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
    weight       DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    exploit_diff INTEGER DEFAULT 5
                 CHECK (exploit_diff BETWEEN 1 AND 10),
    is_active    BOOLEAN DEFAULT TRUE,
    network_id   INTEGER NOT NULL DEFAULT 1
);

-- TABLE 3: ATTACK_SESSION
CREATE TABLE attack_session (
    session_id    SERIAL PRIMARY KEY,
    attacker_node INTEGER REFERENCES node(node_id),
    target_node   INTEGER REFERENCES node(node_id),
    attack_type   VARCHAR(50) DEFAULT 'SHORTEST_PATH'
                  CHECK (attack_type IN ('BFS_ATTACK', 'DFS_ATTACK', 'DIJKSTRA_ATTACK', 'RANDOM_WALK')),
    started_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(30) DEFAULT 'RUNNING'
                  CHECK (status IN ('RUNNING','BLOCKED','COMPLETED')),
    risk_before   INTEGER,
    risk_after    INTEGER
);

-- TABLE 4: ALERT
CREATE TABLE alert (
    alert_id   SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES attack_session(session_id),
    node_id    INTEGER REFERENCES node(node_id),
    severity   VARCHAR(20)
               CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_edge_source    ON edge(source_id);
CREATE INDEX idx_edge_target    ON edge(target_id);
CREATE INDEX idx_edge_active    ON edge(is_active);
CREATE INDEX idx_alert_severity ON alert(severity);
CREATE INDEX idx_node_risk      ON node(risk_level DESC);

-- TRIGGER
CREATE OR REPLACE FUNCTION update_node_risk_on_critical_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.severity = 'CRITICAL' THEN
        UPDATE node
        SET risk_level = LEAST(risk_level + 20, 100)
        WHERE node_id = NEW.node_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_critical_alert
AFTER INSERT ON alert
FOR EACH ROW
EXECUTE FUNCTION update_node_risk_on_critical_alert();

-- SAMPLE DATA
INSERT INTO node (node_name, node_type, ip_address, risk_level) VALUES
('Internet Gateway',  'ROUTER',      '10.0.0.1',  20),
('Web Server',        'SERVER',      '10.0.0.2',  45),
('App Server',        'SERVER',      '10.0.0.3',  40),
('Database Server',   'DATABASE',    '10.0.0.4',  70),
('Admin System',      'ADMIN',       '10.0.0.5',  80),
('Firewall',          'FIREWALL',    '10.0.0.6',  15),
('Workstation A',     'WORKSTATION', '10.0.0.7',  30),
('Workstation B',     'WORKSTATION', '10.0.0.8',  35);

INSERT INTO edge (source_id, target_id, weight, exploit_diff) VALUES
(1, 2, 0.3, 3),
(1, 6, 0.8, 8),
(2, 3, 0.5, 5),
(2, 7, 0.4, 4),
(3, 4, 0.7, 6),
(3, 5, 0.9, 9),
(6, 3, 0.6, 6),
(7, 4, 0.5, 5),
(8, 5, 0.8, 7),
(4, 5, 0.2, 2);