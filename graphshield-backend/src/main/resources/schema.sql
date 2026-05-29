DROP TABLE IF EXISTS remediation_action CASCADE;
DROP TABLE IF EXISTS attack_event_log CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS alert CASCADE;
DROP TABLE IF EXISTS attack_path CASCADE;
DROP TABLE IF EXISTS attack_session CASCADE;
DROP TABLE IF EXISTS edge CASCADE;
DROP TABLE IF EXISTS node CASCADE;
CREATE TABLE node (
    node_id        SERIAL PRIMARY KEY,
    node_name      VARCHAR(100) NOT NULL,
    node_type      VARCHAR(50) NOT NULL CHECK (
        node_type IN ('SERVER','ROUTER','FIREWALL','DATABASE','WORKSTATION','ADMIN')
    ),
    ip_address     VARCHAR(50),
    risk_level     INTEGER DEFAULT 0 CHECK (risk_level BETWEEN 0 AND 100),
    is_compromised BOOLEAN DEFAULT FALSE,
    network_id     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE edge (
    edge_id      SERIAL PRIMARY KEY,
    source_id    INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
    target_id    INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
    weight       DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    exploit_diff INTEGER DEFAULT 5 CHECK (exploit_diff BETWEEN 1 AND 10),
    is_active    BOOLEAN DEFAULT TRUE,
    network_id   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE attack_session (
    session_id    SERIAL PRIMARY KEY,
    attacker_node INTEGER REFERENCES node(node_id),
    target_node   INTEGER REFERENCES node(node_id),
    attack_type   VARCHAR(50) DEFAULT 'DIJKSTRA'
                  CHECK (attack_type IN (
                      'BFS',
                      'DFS',
                      'DIJKSTRA',
                      'BFS_ATTACK',
                      'DFS_ATTACK',
                      'DIJKSTRA_ATTACK',
                      'SHORTEST_PATH',
                      'RANDOM_WALK'
                  )),
    started_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(30) DEFAULT 'RUNNING'
                  CHECK (status IN ('RUNNING','BLOCKED','COMPLETED')),
    risk_before   INTEGER,
    risk_after    INTEGER
);

CREATE TABLE attack_path (
    path_id       SERIAL PRIMARY KEY,
    session_id    INTEGER REFERENCES attack_session(session_id) ON DELETE CASCADE,
    node_id       INTEGER REFERENCES node(node_id) ON DELETE CASCADE,
    step_number   INTEGER NOT NULL CHECK (step_number >= 1),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attack_event_log (
    log_id       SERIAL PRIMARY KEY,
    session_id   INTEGER REFERENCES attack_session(session_id) ON DELETE CASCADE,
    event_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type   VARCHAR(50) NOT NULL,
    source_node  INTEGER REFERENCES node(node_id),
    target_node  INTEGER REFERENCES node(node_id),
    message      TEXT NOT NULL
);

CREATE INDEX idx_attack_event_session ON attack_event_log(session_id);
CREATE INDEX idx_attack_event_time ON attack_event_log(event_time DESC);



CREATE TABLE alert (
    alert_id   SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES attack_session(session_id) ON DELETE CASCADE,
    node_id    INTEGER REFERENCES node(node_id) ON DELETE CASCADE,
    severity   VARCHAR(20) CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE remediation_action (
    action_id     SERIAL PRIMARY KEY,
    session_id    INTEGER REFERENCES attack_session(session_id) ON DELETE CASCADE,
    node_id       INTEGER REFERENCES node(node_id) ON DELETE CASCADE,
    action_type   VARCHAR(50) NOT NULL CHECK (
        action_type IN ('ISOLATE_NODE','REMOVE_EDGE','PATCH_NODE','MONITOR_NODE')
    ),
    description   TEXT,
    status        VARCHAR(30) DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','APPLIED','FAILED')),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    audit_id    SERIAL PRIMARY KEY,
    action_type VARCHAR(50),
    table_name  VARCHAR(50),
    record_id   INTEGER,
    old_value   TEXT,
    new_value   TEXT,
    logged_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_edge_source       ON edge(source_id);
CREATE INDEX idx_edge_target       ON edge(target_id);
CREATE INDEX idx_edge_active       ON edge(is_active);
CREATE INDEX idx_alert_severity    ON alert(severity);
CREATE INDEX idx_node_risk         ON node(risk_level DESC);
CREATE INDEX idx_attack_session    ON attack_session(started_at DESC);
CREATE INDEX idx_audit_logged_at   ON audit_log(logged_at DESC);

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

CREATE OR REPLACE FUNCTION log_node_risk_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.risk_level IS DISTINCT FROM NEW.risk_level THEN
        INSERT INTO audit_log (
            action_type,
            table_name,
            record_id,
            old_value,
            new_value
        )
        VALUES (
            'RISK_UPDATE',
            'node',
            NEW.node_id,
            OLD.risk_level::TEXT,
            NEW.risk_level::TEXT
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_node_risk_update
AFTER UPDATE ON node
FOR EACH ROW
EXECUTE FUNCTION log_node_risk_update();

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
(1, 2, 0.30, 3),
(1, 6, 0.80, 8),
(2, 3, 0.50, 5),
(2, 7, 0.40, 4),
(3, 4, 0.70, 6),
(3, 5, 0.90, 9),
(6, 3, 0.60, 6),
(7, 4, 0.50, 5),
(8, 5, 0.80, 7),
(4, 5, 0.20, 2);

INSERT INTO attack_session (
    attacker_node,
    target_node,
    attack_type,
    status,
    risk_before,
    risk_after
)
VALUES (
    1,
    5,
    'DIJKSTRA',
    'COMPLETED',
    85,
    45
);

INSERT INTO alert (
    session_id,
    node_id,
    severity,
    message
)
VALUES (
    1,
    5,
    'CRITICAL',
    'Critical compromise detected on Admin System'
);

INSERT INTO attack_path (session_id, node_id, step_number) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 5, 4);

INSERT INTO remediation_action (
    session_id,
    node_id,
    action_type,
    description,
    status
)
VALUES (
    1,
    5,
    'ISOLATE_NODE',
    'Admin System isolated after critical compromise',
    'APPLIED'
);