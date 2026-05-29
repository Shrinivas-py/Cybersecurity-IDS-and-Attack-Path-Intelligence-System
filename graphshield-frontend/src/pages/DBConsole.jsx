import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Play, Terminal, Shield, Zap, GitBranch, AlertTriangle, RefreshCw, Lock, Eye, List } from 'lucide-react'
import { dbApi } from '../api/api'

const PRESETS = [
  {
    category: 'STORED PROCEDURES',
    color: 'var(--cyan)',
    items: [
      { name: 'network_risk', label: 'SP1: Network Risk Score', icon: Shield, desc: 'calculate_network_risk(1) — aggregates risk across all nodes' },
      { name: 'recommendations', label: 'SP2: Risk Recommendations', icon: AlertTriangle, desc: 'get_risk_recommendations(1) — per-node remediation advice' },
      { name: 'attack_summary', label: 'SP3: Attack Session Summary', icon: Database, desc: 'get_attack_summary(1) — full attack analytics report' },
      { name: 'safe_remediation', label: 'SP4: Safe Remediation TX', icon: Lock, desc: 'safe_remediation(1,2,1) — transaction with rollback safety' },
    ]
  },
  {
    category: 'CURSOR',
    color: 'var(--amber)',
    items: [
      { name: 'flag_critical', label: 'CURSOR: Flag Critical Nodes', icon: Zap, desc: 'flag_critical_nodes(1) — loops row-by-row and marks risk >= 85 as compromised' },
    ]
  },
  {
    category: 'TRIGGERS & AUDIT',
    color: 'var(--green)',
    items: [
      { name: 'triggers', label: 'Show All Triggers', icon: Zap, desc: 'Lists all PostgreSQL triggers from information_schema' },
      { name: 'audit', label: 'Audit Log', icon: Eye, desc: 'audit_log — auto-populated by trigger on node risk update' },
      { name: 'alerts', label: 'Alert Log', icon: AlertTriangle, desc: 'Alerts generated during attack simulation' },
      {
  name: 'attack_logs',
  label: 'Attack Event Logs',
  icon: Terminal,
  desc: 'Raw attack timeline: start, node visits, edge traversal, target result'
},
    ]
  },
  {
    category: 'SCHEMA INTROSPECTION',
    color: '#bf00ff',
    items: [
      { name: 'indexes', label: 'Show Indexes', icon: List, desc: 'All indexes on public schema' },
      { name: 'constraints', label: 'Show Constraints', icon: Lock, desc: 'All constraints: PK, FK, CHECK' },
      { name: 'nodes', label: 'Node Table', icon: Database, desc: 'Full node inventory' },
      { name: 'edges', label: 'Edge Table', icon: GitBranch, desc: 'Network connections' },
      { name: 'sessions', label: 'Attack Sessions', icon: Terminal, desc: 'Recent attack session history' },
    ]
  },
]

function ResultTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="mono" style={{ color: 'var(--muted)', padding: '20px', textAlign: 'center', fontSize: 12 }}>
        Query returned 0 rows
      </div>
    )
  }

  const cols = Object.keys(rows[0])

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {cols.map(c => (
              <th key={c} className="mono" style={{
                padding: '6px 12px',
                textAlign: 'left',
                fontSize: 10,
                color: 'var(--cyan)',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
                background: 'rgba(0,212,255,0.05)',
              }}>
                {c.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cyan-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cols.map(c => {
                const val = row[c]
                const isRisk = c === 'risk_level' || c === 'average_risk'
                const isBool = typeof val === 'boolean'
                const isStatus = c === 'overall_status' || c === 'status'

                const color = isRisk
                  ? val >= 80 ? 'var(--red)' : val >= 60 ? 'var(--amber)' : 'var(--green)'
                  : isBool ? (val ? 'var(--red)' : 'var(--green)')
                  : isStatus
                    ? val === 'CRITICAL' ? 'var(--red)' : val === 'HIGH' ? 'var(--amber)' : val === 'COMPLETED' ? 'var(--green)' : 'var(--muted)'
                    : 'var(--text)'

                return (
                  <td key={c} className="mono" style={{
                    padding: '6px 12px',
                    color,
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    fontWeight: isRisk || isStatus ? 700 : 400,
                  }}>
                    {val === null
                      ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>null</span>
                      : isBool ? (val ? '✓ TRUE' : '✗ FALSE')
                      : String(val)}
                  </td>
                )
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DBConsole() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const [customSql, setCustomSql] = useState('SELECT * FROM calculate_network_risk(1);')
  const [sqlHistory, setSqlHistory] = useState([])
  const [tab, setTab] = useState('presets')

  const runPreset = async (name, label) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setActivePreset(name)

    try {
      const res = await dbApi.procedure(name)
      setResult({
        rows: res.data.rows,
        count: res.data.count,
        sql: res.data.sql,
        label
      })
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  const runCustom = async () => {
    const sql = customSql.trim()
    if (!sql) return

    setLoading(true)
    setError(null)
    setResult(null)
    setActivePreset(null)

    try {
      const res = await dbApi.query(sql)
      setResult({
        rows: res.data.rows,
        count: res.data.count,
        sql,
        label: 'Custom Query'
      })
      setSqlHistory(p => [sql, ...p.filter(s => s !== sql)].slice(0, 10))
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.2em' }}>◈ LIVE DATABASE</div>
          <div className="orbitron" style={{ fontSize: 15, fontWeight: 700 }}>DB Console</div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[['presets', 'Procedures'], ['console', 'SQL Terminal']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: tab === id ? 'var(--cyan-dim)' : 'transparent',
              borderBottom: tab === id ? '2px solid var(--cyan)' : '2px solid transparent',
              color: tab === id ? 'var(--cyan)' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
            }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'presets' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PRESETS.map(group => (
              <div key={group.category}>
                <div className="mono" style={{ fontSize: 9, color: group.color, marginBottom: 6, letterSpacing: '0.12em' }}>
                  {group.category}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = activePreset === item.name

                    return (
                      <button key={item.name} onClick={() => runPreset(item.name, item.label)} style={{
                        padding: '9px 11px',
                        border: `1px solid ${active ? group.color : 'var(--border)'}`,
                        background: active ? `${group.color}15` : 'transparent',
                        borderRadius: 2,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}>
                        <Icon size={13} color={active ? group.color : 'var(--muted)'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: active ? group.color : 'var(--text)' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, lineHeight: 1.3 }}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'console' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Only SELECT statements allowed</div>

            <textarea
              value={customSql}
              onChange={e => setCustomSql(e.target.value)}
              style={{
                background: '#060a12',
                border: '1px solid var(--border)',
                color: 'var(--cyan)',
                fontFamily: 'Share Tech Mono',
                fontSize: 12,
                padding: '10px',
                borderRadius: 2,
                resize: 'vertical',
                minHeight: 120,
                outline: 'none',
                lineHeight: 1.6,
              }}
              placeholder="SELECT * FROM node WHERE risk_level > 70;"
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runCustom() }}
            />

            <button onClick={runCustom} disabled={loading} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 16px',
              border: '1px solid var(--cyan)',
              borderRadius: 2,
              background: 'transparent',
              color: 'var(--cyan)',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              opacity: loading ? 0.6 : 1,
            }}>
              <Play size={13} /> {loading ? 'RUNNING...' : 'EXECUTE  (Ctrl+Enter)'}
            </button>

            {sqlHistory.length > 0 && (
              <div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 6 }}>HISTORY</div>
                {sqlHistory.map((s, i) => (
                  <button key={i} onClick={() => setCustomSql(s)} style={{
                    width: '100%',
                    marginBottom: 3,
                    padding: '5px 8px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    color: 'var(--muted)',
                    fontSize: 10,
                    fontFamily: 'Share Tech Mono',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            {result && (
              <>
                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)' }}>{result.label}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{result.sql}</div>
              </>
            )}

            {!result && !loading && !error && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                Select a procedure or write SQL to execute
              </div>
            )}

            {loading && <div className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>Executing query...</div>}
            {error && <div className="mono" style={{ fontSize: 11, color: 'var(--red)' }}>ERROR: {error}</div>}
          </div>

          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }}>
                ✓ {result.count} row{result.count !== 1 ? 's' : ''} returned
              </span>

              <button onClick={() => { setResult(null); setError(null); setActivePreset(null) }} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: '1px solid var(--border)',
                borderRadius: 2,
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Rajdhani, sans-serif',
              }}>
                <RefreshCw size={11} /> Clear
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: 40, textAlign: 'center' }}>
                <div className="mono" style={{ color: 'var(--cyan)', fontSize: 13 }}>◈ EXECUTING QUERY_</div>
              </motion.div>
            )}

            {!loading && !result && !error && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <Database size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                <div className="orbitron" style={{ fontSize: 14, marginBottom: 8 }}>POSTGRESQL CONSOLE</div>
                <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                  <div>Run stored procedures, cursors, triggers, transactions</div>
                  <div>All DBMS features visible live</div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                  {[
                    ['PRIMARY KEY', 'var(--cyan)'],
                    ['FOREIGN KEY', 'var(--cyan)'],
                    ['TRIGGERS x2', 'var(--green)'],
                    ['STORED PROCS x4', 'var(--amber)'],
                    ['CURSOR', 'var(--amber)'],
                    ['TRANSACTIONS', 'var(--red)'],
                    ['INDEXES', 'var(--muted)'],
                    ['3NF NORMALIZED', 'var(--green)'],
                  ].map(([label, color]) => (
                    <span key={label} style={{
                      padding: '4px 10px',
                      borderRadius: 2,
                      fontSize: 10,
                      fontFamily: 'Share Tech Mono',
                      border: `1px solid ${color}`,
                      color,
                      background: `${color}10`,
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ResultTable rows={result.rows} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}