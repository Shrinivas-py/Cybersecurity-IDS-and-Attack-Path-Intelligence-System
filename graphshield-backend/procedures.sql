
-- =============================================
-- STORED PROCEDURE 1
-- Calculate overall network risk score
-- Usage: SELECT * FROM calculate_network_risk(1);
-- =============================================
CREATE OR REPLACE FUNCTION calculate_network_risk(p_network_id INTEGER)
RETURNS TABLE (
    total_nodes INTEGER,
    critical_nodes INTEGER,
    high_risk_nodes INTEGER,
    average_risk DECIMAL,
    overall_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_nodes,
        COUNT(*) FILTER (WHERE risk_level >= 80)::INTEGER AS critical_nodes,
        COUNT(*) FILTER (WHERE risk_level >= 60 AND risk_level < 80)::INTEGER AS high_risk_nodes,
        ROUND(AVG(risk_level), 2) AS average_risk,
        CASE
            WHEN AVG(risk_level) >= 80 THEN 'CRITICAL'
            WHEN AVG(risk_level) >= 60 THEN 'HIGH'
            WHEN AVG(risk_level) >= 40 THEN 'MEDIUM'
            ELSE 'LOW'
        END::VARCHAR AS overall_status
    FROM node
    WHERE network_id = p_network_id;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- STORED PROCEDURE 2
-- Get full attack session summary report
-- Usage: SELECT * FROM get_attack_summary(1);
-- =============================================
CREATE OR REPLACE FUNCTION get_attack_summary(p_session_id INTEGER)
RETURNS TABLE (
    session_id INTEGER,
    attacker_name VARCHAR,
    target_name VARCHAR,
    attack_type VARCHAR,
    status VARCHAR,
    risk_before INTEGER,
    risk_after INTEGER,
    risk_reduction INTEGER,
    total_alerts INTEGER,
    critical_alerts INTEGER,
    started_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.session_id,
        n1.node_name AS attacker_name,
        n2.node_name AS target_name,
        s.attack_type,
        s.status,
        s.risk_before,
        s.risk_after,
        COALESCE(s.risk_before - s.risk_after, 0) AS risk_reduction,
        COUNT(a.alert_id)::INTEGER AS total_alerts,
        COUNT(a.alert_id) FILTER (WHERE a.severity = 'CRITICAL')::INTEGER AS critical_alerts,
        s.started_at
    FROM attack_session s
    LEFT JOIN node n1 ON s.attacker_node = n1.node_id
    LEFT JOIN node n2 ON s.target_node = n2.node_id
    LEFT JOIN alert a ON s.session_id = a.session_id
    WHERE s.session_id = p_session_id
    GROUP BY s.session_id, n1.node_name, n2.node_name,
             s.attack_type, s.status, s.risk_before,
             s.risk_after, s.started_at;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- STORED PROCEDURE 3
-- Get all high risk nodes with recommendations
-- Usage: SELECT * FROM get_risk_recommendations(1);
-- =============================================
CREATE OR REPLACE FUNCTION get_risk_recommendations(p_network_id INTEGER)
RETURNS TABLE (
    node_id INTEGER,
    node_name VARCHAR,
    node_type VARCHAR,
    risk_level INTEGER,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.node_id,
        n.node_name,
        n.node_type,
        n.risk_level,
        CASE
            WHEN n.risk_level >= 90 THEN
                'IMMEDIATE ACTION: Isolate this node. Install latest security patches. Enable 2FA.'
            WHEN n.risk_level >= 80 THEN
                'HIGH PRIORITY: Monitor all traffic. Restrict access. Review firewall rules.'
            WHEN n.risk_level >= 60 THEN
                'MEDIUM PRIORITY: Schedule security audit. Update credentials.'
            ELSE
                'LOW RISK: Maintain regular monitoring and updates.'
        END::TEXT AS recommendation
    FROM node n
    WHERE n.network_id = p_network_id
    ORDER BY n.risk_level DESC;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- CURSOR IMPLEMENTATION
-- Loop through all nodes, flag compromised ones
-- and log alerts for critical risk nodes
-- =============================================
CREATE OR REPLACE FUNCTION flag_critical_nodes(p_network_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    node_record RECORD;
    flagged_count INTEGER := 0;
    v_cursor CURSOR FOR
        SELECT node_id, node_name, risk_level
        FROM node
        WHERE network_id = p_network_id
        ORDER BY risk_level DESC;
BEGIN
    OPEN v_cursor;

    LOOP
        FETCH v_cursor INTO node_record;
        EXIT WHEN NOT FOUND;

        -- If risk is critical, mark as compromised
        IF node_record.risk_level >= 85 THEN
            UPDATE node
            SET is_compromised = TRUE
            WHERE node_id = node_record.node_id;

            flagged_count := flagged_count + 1;
        END IF;

    END LOOP;

    CLOSE v_cursor;

    RETURN 'Cursor scan complete. Flagged ' || flagged_count || ' critical nodes as compromised.';
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- TRANSACTION EXAMPLE
-- Safe remediation with rollback on failure
-- =============================================
CREATE OR REPLACE FUNCTION safe_remediation(
    p_edge_source INTEGER,
    p_edge_target INTEGER,
    p_network_id INTEGER
)
RETURNS TEXT AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Start transaction block
    BEGIN
        -- Deactivate the risky edge
        UPDATE edge
        SET is_active = FALSE
        WHERE source_id = p_edge_source
          AND target_id = p_edge_target
          AND network_id = p_network_id;

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows = 0 THEN
            RAISE EXCEPTION 'Edge not found: % -> %', p_edge_source, p_edge_target;
        END IF;

        -- Update risk levels of affected nodes
        UPDATE node
        SET risk_level = GREATEST(risk_level - 15, 0)
        WHERE node_id = p_edge_target
          AND network_id = p_network_id;

        RETURN 'Transaction committed. Edge ' || p_edge_source ||
               ' -> ' || p_edge_target || ' deactivated successfully.';

    EXCEPTION WHEN OTHERS THEN
        -- Auto rollback happens here
        RETURN 'Transaction rolled back. Error: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;