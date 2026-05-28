import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Network } from 'lucide-react'
import { networkApi } from '../api/api'

const riskColor = r => r < 30 ? 'var(--green)' : r < 60 ? 'var(--amber)' : 'var(--red)'
const riskLabel = r => r < 30 ? 'LOW' : r < 60 ? 'MEDIUM' : r < 80 ? 'HIGH' : 'CRITICAL'

export default function Analysis() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [attackResult, setAttackResult] = useState(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
  networkApi.getNodes().then(r => setNodes(r.data)).catch(() => {})
  networkApi.getEdges().then(r => setEdges(r.data)).catch(() => {})

  const stored = localStorage.getItem('attackResult')

  if (stored) {
    setAttackResult(JSON.parse(stored))
  }
}, [])

  const getNodeName = id =>
    nodes.find(n => String(n.nodeId) === String(id))?.nodeName || `Node ${id}`

  const downloadPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF()
        const ts = new Date().toLocaleString()

        doc.setFillColor(10, 14, 26)
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(0, 212, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('GRAPHSHIELD IDS', 14, 18)

        doc.setFontSize(10)
        doc.setTextColor(139, 148, 158)
        doc.text('Network Security Analysis & DBMS Compliance Report', 14, 26)
        doc.text(`Generated: ${ts}`, 14, 33)

        let y = 50

        doc.setTextColor(0, 212, 255)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('NETWORK SUMMARY', 14, y)
        y += 8

        doc.setTextColor(40, 40, 40)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        const summary = [
          `Total Nodes: ${nodes.length}`,
          `Compromised Nodes: ${nodes.filter(n => n.isCompromised).length}`,
          `Average Risk Score: ${nodes.length ? Math.round(nodes.reduce((s, n) => s + n.riskLevel, 0) / nodes.length) : 0}`,
          `Critical Nodes (>=80): ${nodes.filter(n => n.riskLevel >= 80).length}`,
          `Active Edges: ${edges.filter(e => e.isActive).length}`,
          `Stored Procedures: 4`,
          `Triggers: 2`,
          `Transactions Enabled: YES`,
          `Normalization: 3NF`,
        ]

        summary.forEach(line => {
          doc.text(line, 14, y)
          y += 6
        })

        y += 8

        doc.setTextColor(0, 212, 255)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('DBMS COMPLIANCE', 14, y)
        y += 8

        doc.setTextColor(40, 40, 40)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        const dbms = [
          'Primary Keys',
          'Foreign Keys',
          '3NF Normalization',
          'Stored Procedures',
          'Triggers',
          'Cursor',
          'Transactions',
          'Referential Integrity',
          'Indexes',
          'Database Constraints'
        ]

        dbms.forEach(item => {
          doc.text(`✓ ${item}`, 14, y)
          y += 6
        })

        y += 6

        if (attackResult) {
          doc.setTextColor(255, 59, 59)
          doc.setFontSize(13)
          doc.setFont('helvetica', 'bold')
          doc.text('ATTACK SIMULATION RESULT', 14, y)
          y += 8

          doc.setTextColor(40, 40, 40)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')

          const attackInfo = [
            `Attack Type: ${attackResult.attackType}`,
            `Target Reached: ${attackResult.targetReached ? 'YES - CRITICAL' : 'NO - DEFENDED'}`,
            `Risk Score: ${attackResult.riskScore}/100`,
            `Attack Path: ${attackResult.attackPath?.join(' -> ') || 'N/A'}`,
          ]

          attackInfo.forEach(line => {
            doc.text(line, 14, y)
            y += 6
          })

          if (attackResult.recommendations?.length) {
            y += 4
            doc.setTextColor(0, 150, 80)
            doc.setFont('helvetica', 'bold')
            doc.text('RECOMMENDATIONS', 14, y)
            y += 7

            doc.setTextColor(40, 40, 40)
            doc.setFont('helvetica', 'normal')

            attackResult.recommendations.forEach(r => {
              const lines = doc.splitTextToSize(`- ${r}`, 180)
              doc.text(lines, 14, y)
              y += lines.length * 6
            })
          }

          y += 6
        }

        doc.setTextColor(0, 212, 255)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('NODE INVENTORY', 14, y)
        y += 6

        doc.autoTable({
          startY: y,
          head: [['ID', 'Name', 'Type', 'IP Address', 'Risk', 'Status']],
          body: nodes.map(n => [
            n.nodeId,
            n.nodeName,
            n.nodeType,
            n.ipAddress || '-',
            n.riskLevel,
            n.isCompromised ? 'COMPROMISED' : 'SECURE'
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [13, 17, 23],
            textColor: [0, 212, 255],
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8
          },
          styles: {
            cellPadding: 3
          },
        })

        doc.save(`graphshield-report-${Date.now()}.pdf`)
      })
    })
  }

  const typeMap = {}
  nodes.forEach(n => {
    typeMap[n.nodeType] = (typeMap[n.nodeType] || []).concat(n.riskLevel)
  })

  const typeData = Object.entries(typeMap).map(([type, vals]) => ({
    type,
    avgRisk: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }))

  const connectivity = nodes
  .map(n => ({
    name: n.nodeName,
    degree: edges.filter(e =>
      e.sourceNodeId === n.nodeId ||
      e.targetNodeId === n.nodeId ||
      e.sourceId === n.nodeId ||
      e.targetId === n.nodeId
    ).length,
  }))
  .sort((a, b) => b.degree - a.degree)
  .slice(0, 10)

  const avgRisk = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.riskLevel, 0) / nodes.length)
    : 0

  const compromised = nodes.filter(n => n.isCompromised).length
  const highRisk = nodes.filter(n => n.riskLevel >= 80).length

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'topology', label: 'Topology' },
    { id: 'attack', label: 'Attack Result' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.2em' }}>
            ◈ INTELLIGENCE
          </div>
          <div className="orbitron" style={{ fontSize: 16, fontWeight: 700 }}>
            Analysis
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="btn"
                style={{
                  color: tab === t.id ? 'var(--cyan)' : 'var(--muted)',
                  borderColor: tab === t.id ? 'var(--cyan)' : 'var(--border)',
                  background: tab === t.id ? 'var(--cyan-dim)' : 'transparent',
                  padding: '5px 14px',
                  fontSize: 12,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button onClick={downloadPDF} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            border: '1px solid var(--cyan)',
            borderRadius: 2,
            background: 'transparent',
            color: 'var(--cyan)',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            ↓ Export PDF
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {[
                    ['Total Nodes', nodes.length, 'var(--cyan)', Network],
                    ['Avg Risk Score', avgRisk, avgRisk >= 60 ? 'var(--red)' : 'var(--amber)', TrendingUp],
                    ['Compromised', compromised, compromised > 0 ? 'var(--red)' : 'var(--green)', AlertTriangle],
                    ['Critical (>=80)', highRisk, highRisk > 0 ? 'var(--red)' : 'var(--green)', CheckCircle],
                  ].map(([label, val, color, Icon]) => (
                    <div key={label} className="card bracket" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 6 }}>
                            {label.toUpperCase()}
                          </div>
                          <div className="orbitron" style={{ fontSize: 28, fontWeight: 700, color }}>
                            {val}
                          </div>
                        </div>
                        <Icon size={18} color={color} style={{ opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '14px 18px' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                    DBMS FEATURES IMPLEMENTED
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {[
                      '3NF NORMALIZATION',
                      'PRIMARY KEYS',
                      'FOREIGN KEYS',
                      'STORED PROCEDURES',
                      'TRIGGERS',
                      'CURSOR',
                      'TRANSACTIONS',
                      'INDEXES'
                    ].map(item => (
                      <div key={item} style={{
                        padding: '10px',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        textAlign: 'center',
                        fontSize: 11,
                        fontFamily: 'Share Tech Mono',
                        color: 'var(--cyan)',
                        background: 'var(--cyan-dim)',
                        fontWeight: 700
                      }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px 18px' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                    RISK DISTRIBUTION BY NODE TYPE
                  </div>

                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={typeData}>
                      <XAxis dataKey="type" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip
  contentStyle={{
    background: '#0d1117',
    border: '1px solid #00d4ff33',
    borderRadius: '6px',
    color: '#ffffff',
    fontFamily: 'Share Tech Mono',
    fontSize: 11,
    boxShadow: '0 0 20px rgba(0,212,255,0.15)',
  }}
  labelStyle={{
    color: '#00d4ff',
    fontWeight: 700,
  }}
  itemStyle={{
    color: '#ffffff',
  }}
  cursor={{ fill: 'rgba(0,212,255,0.08)' }}
/>
                      <Bar dataKey="avgRisk" radius={[3, 3, 0, 0]} name="Avg Risk">
                        {typeData.map((d, i) => (
                          <Cell key={i} fill={riskColor(d.avgRisk)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: '14px 18px' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>
                    NODE INVENTORY
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['ID', 'Name', 'Type', 'IP Address', 'Risk', 'Status'].map(h => (
                            <th key={h} className="mono" style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {nodes.map(n => (
                          <tr key={n.nodeId} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="mono" style={{ padding: '6px 10px', color: 'var(--muted)', fontSize: 11 }}>
                              {n.nodeId}
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>
                              {n.nodeName}
                            </td>
                            <td className="mono" style={{ padding: '6px 10px', fontSize: 11, color: 'var(--amber)' }}>
                              {n.nodeType}
                            </td>
                            <td className="mono" style={{ padding: '6px 10px', fontSize: 11, color: 'var(--muted)' }}>
                              {n.ipAddress || '-'}
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              <span style={{ color: riskColor(n.riskLevel), fontFamily: 'Share Tech Mono', fontSize: 12, fontWeight: 700 }}>
                                {n.riskLevel}
                              </span>
                              <span className="mono" style={{ fontSize: 9, marginLeft: 4, color: riskColor(n.riskLevel) }}>
                                {riskLabel(n.riskLevel)}
                              </span>
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              <span style={{
                                fontSize: 9,
                                padding: '2px 6px',
                                borderRadius: 2,
                                fontFamily: 'Share Tech Mono',
                                background: n.isCompromised ? 'var(--red-dim)' : 'var(--green-dim)',
                                color: n.isCompromised ? 'var(--red)' : 'var(--green)',
                              }}>
                                {n.isCompromised ? 'COMPROMISED' : 'SECURE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'topology' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="card" style={{ padding: '14px 18px' }}>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>
                      NODE CONNECTIVITY TOP 10
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={connectivity}>
                        <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 9, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 2, fontFamily: 'Share Tech Mono', fontSize: 11 }} />
                        <Bar dataKey="degree" fill="#00d4ff" radius={[3, 3, 0, 0]} name="Connections" fillOpacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card" style={{ padding: '14px 18px' }}>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10 }}>
                      EDGE STATISTICS
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        ['Total Edges', edges.length, 'var(--cyan)'],
                        ['Active Edges', edges.filter(e => e.isActive).length, 'var(--green)'],
                        ['Avg Edge Weight', edges.length ? (edges.reduce((s, e) => s + (e.weight || 1), 0) / edges.length).toFixed(2) : 0, 'var(--amber)'],
                        ['Network Density', edges.length && nodes.length > 1 ? (edges.length / (nodes.length * (nodes.length - 1) / 2) * 100).toFixed(1) + '%' : '0%', 'var(--muted)'],
                      ].map(([l, v, c]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg)', borderRadius: 2 }}>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
                          <span className="orbitron" style={{ fontSize: 14, color: c }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'attack' && (
              <div>
                {!attackResult ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                    <BarChart2 size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                    <div className="mono" style={{ fontSize: 13 }}>NO SIMULATION DATA</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>Run an attack simulation first</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {[
                        ['Attack Type', attackResult.attackType?.replace('_ATTACK',''), 'var(--amber)'],
                        ['Risk Score', attackResult.riskScore, attackResult.riskScore >= 60 ? 'var(--red)' : 'var(--amber)'],
                        ['Target Reached', attackResult.targetReached ? 'YES' : 'NO', attackResult.targetReached ? 'var(--red)' : 'var(--green)'],
                      ].map(([l, v, c]) => (
                        <div key={l} className="card bracket" style={{ padding: '14px 18px' }}>
                          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 6 }}>
                            {l.toUpperCase()}
                          </div>
                          <div className="orbitron" style={{ fontSize: 24, fontWeight: 700, color: c }}>
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>

                    {attackResult.attackPath?.length > 0 && (
                      <div className="card" style={{ padding: '14px 18px' }}>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                          ATTACK TRAVERSAL PATH
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: 8 }}>
                          {attackResult.attackPath.map((id, i) => (
                            <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                padding: '6px 12px',
                                borderRadius: 2,
                                background: i === 0 ? 'var(--cyan-dim)' : i === attackResult.attackPath.length - 1 ? 'var(--red-dim)' : 'var(--amber-dim)',
                                border: `1px solid ${i === 0 ? 'var(--cyan)' : i === attackResult.attackPath.length - 1 ? 'var(--red)' : 'var(--amber)'}`,
                              }}>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>
                                  HOP {i + 1}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>
                                  {getNodeName(id)}
                                </div>
                              </div>

                              {i < attackResult.attackPath.length - 1 && (
                                <div style={{ padding: '0 8px', color: 'var(--red)', fontSize: 18 }}>
                                  →
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {attackResult.recommendations?.length > 0 && (
                      <div className="card" style={{ padding: '14px 18px' }}>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em', marginBottom: 10 }}>
                          ◈ RECOMMENDATIONS
                        </div>

                        {attackResult.recommendations.map((r, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                              padding: '8px 12px',
                              marginBottom: 6,
                              background: 'var(--green-dim)',
                              border: '1px solid rgba(0,255,136,0.2)',
                              borderRadius: 2,
                              fontSize: 13,
                              display: 'flex',
                              gap: 8
                            }}
                          >
                            <span style={{ color: 'var(--green)', flexShrink: 0 }}>›</span>
                            <span>{r}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}