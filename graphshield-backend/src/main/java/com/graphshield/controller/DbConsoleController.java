package com.graphshield.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/db")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://cybersecurity-ids-and-attack-path-i.vercel.app"
})
public class DbConsoleController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/query")
    public ResponseEntity<?> runQuery(@RequestBody Map<String, String> body) {

        String sql = body.get("sql").trim().toLowerCase();

        if (!sql.startsWith("select")) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Only SELECT statements allowed"));
        }

        try {
            List<Map<String, Object>> rows =
                jdbcTemplate.queryForList(body.get("sql"));

            return ResponseEntity.ok(
                Map.of(
                    "rows", rows,
                    "count", rows.size()
                )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/procedures")
    public ResponseEntity<?> runProcedure(@RequestParam String name) {

        try {
            String sql = switch (name) {

                case "network_risk" ->
                    "SELECT * FROM calculate_network_risk(1)";

                case "recommendations" ->
                    "SELECT * FROM get_risk_recommendations(1)";

                case "attack_summary" ->
                    "SELECT * FROM get_attack_summary(1)";

                case "safe_remediation" ->
                    "SELECT safe_remediation(1, 2, 1)";

                case "flag_critical" ->
                    "SELECT flag_critical_nodes(1)";

                case "nodes" ->
                    """
                    SELECT
                        node_id,
                        node_name,
                        node_type,
                        ip_address,
                        risk_level,
                        is_compromised
                    FROM node
                    WHERE network_id = 1
                    ORDER BY risk_level DESC
                    """;

                case "edges" ->
                    """
                    SELECT *
                    FROM edge
                    WHERE network_id = 1
                    """;

                case "sessions" ->
                    """
                    SELECT *
                    FROM attack_session
                    ORDER BY started_at DESC
                    LIMIT 10
                    """;

                case "alerts" ->
                    """
                    SELECT
                        a.*,
                        n.node_name
                    FROM alert a
                    JOIN node n
                    ON a.node_id = n.node_id
                    ORDER BY a.created_at DESC
                    LIMIT 20
                    """;

                case "audit" ->
                    """
                    SELECT *
                    FROM audit_log
                    ORDER BY logged_at DESC
                    LIMIT 20
                    """;

                case "triggers" ->
                    """
                    SELECT
                        trigger_name,
                        event_manipulation,
                        event_object_table,
                        action_statement
                    FROM information_schema.triggers
                    WHERE trigger_schema = 'public'
                    ORDER BY trigger_name
                    """;

                case "indexes" ->
                    """
                    SELECT
                        indexname,
                        tablename,
                        indexdef
                    FROM pg_indexes
                    WHERE schemaname = 'public'
                    ORDER BY tablename
                    """;

                case "constraints" ->
                    """
                    SELECT
                        conname,
                        contype,
                        conrelid::regclass AS table_name
                    FROM pg_constraint
                    WHERE connamespace = 'public'::regnamespace
                    ORDER BY table_name
                    """;

                case "attack_logs" ->
    """
    SELECT
        l.log_id,
        l.session_id,
        l.event_time,
        l.event_type,
        sn.node_name AS source_node,
        tn.node_name AS target_node,
        l.message
    FROM attack_event_log l
    LEFT JOIN node sn ON l.source_node = sn.node_id
    LEFT JOIN node tn ON l.target_node = tn.node_id
    ORDER BY l.log_id ASC
    LIMIT 50
    """;

                default ->
                    throw new IllegalArgumentException(
                        "Unknown procedure: " + name
                    );
            };

            List<Map<String, Object>> rows =
                jdbcTemplate.queryForList(sql);

            return ResponseEntity.ok(
                Map.of(
                    "rows", rows,
                    "count", rows.size(),
                    "sql", sql
                )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}