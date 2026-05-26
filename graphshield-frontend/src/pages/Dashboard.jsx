import { useEffect, useState } from 'react'
import { networkApi } from '../api/api'
import { Shield, AlertTriangle, Server, Wifi, Activity, Lock } from 'lucide-react'

export default function Dashboard() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    networkApi.getNodes().then(r => {
      setNodes(r.data)
      setLoading(false)
    })
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const criticalNodes = nodes.filter(n => n.riskLevel >= 80)
  const highNodes = nodes.filter(n => n.riskLevel >= 60 && n.riskLevel < 80)
  const safeNodes = nodes.filter(n => n.riskLevel < 60)
  const avgRisk = nodes.length ? Math.round(nodes.reduce((a, b) => a + b.riskLevel, 0) / nodes.length) : 0

  const stats = [
    { label: 'Total Nodes',      value: nodes.length,        icon: Server,        color: '#00d4ff' },
    { label: 'Critical Risk',    value: criticalNodes.length, icon: AlertTriangle, color: '#ff3b3b' },
    { label: 'High Risk',        value: highNodes.length,     icon: Activity,      color: '#ffaa00' },
    { label: 'Secure Nodes',     value: safeNodes.length,     icon: Lock,          color: '#00ff88' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00d4ff] font-mono tracking-wider">
            SECURITY DASHBOARD
          </h2>
          <p className="text-[#3a4a5c] text-sm font-mono mt-1">
            TechCorp Enterprise Network — Real-time Monitoring
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#00ff88] font-mono text-sm">
            {time.toLocaleTimeString()}
          </p>
          <p className="text-[#3a4a5c] font-mono text-xs">
            {time.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4 hover:border-[#00d4ff33] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#3a4a5c] text-xs font-mono uppercase tracking-wider">{label}</p>
                <p style={{ color }} className="text-3xl font-bold font-mono mt-2">
                  {loading ? '--' : value}
                </p>
              </div>
              <Icon style={{ color }} className="w-6 h-6 opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Overall Risk */}
      <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6">
        <h3 className="text-[#00d4ff] font-mono text-sm uppercase tracking-wider mb-4">
          Network Risk Level
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[#1e2d40] rounded-full h-4">
            <div
              className="h-4 rounded-full transition-all duration-1000"
              style={{
                width: `${avgRisk}%`,
                backgroundColor: avgRisk >= 80 ? '#ff3b3b' : avgRisk >= 60 ? '#ffaa00' : '#00ff88'
              }}
            />
          </div>
          <span className="text-white font-mono font-bold text-xl w-16">{avgRisk}%</span>
        </div>
        <p className="text-[#3a4a5c] text-xs font-mono mt-2">
          Average risk score across all {nodes.length} network nodes
        </p>
      </div>

      {/* Node List */}
      <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6">
        <h3 className="text-[#00d4ff] font-mono text-sm uppercase tracking-wider mb-4">
          Node Risk Overview
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {nodes
            .sort((a, b) => b.riskLevel - a.riskLevel)
            .map(node => (
              <div key={node.nodeId} className="flex items-center gap-3 p-2 hover:bg-[#1a2332] rounded transition-all">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: node.riskLevel >= 80 ? '#ff3b3b'
                      : node.riskLevel >= 60 ? '#ffaa00' : '#00ff88'
                  }}
                />
                <span className="text-[#8b9bb4] text-sm font-mono flex-1">{node.nodeName}</span>
                <span className="text-[#3a4a5c] text-xs font-mono">{node.nodeType}</span>
                <div className="w-24 bg-[#1e2d40] rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${node.riskLevel}%`,
                      backgroundColor: node.riskLevel >= 80 ? '#ff3b3b'
                        : node.riskLevel >= 60 ? '#ffaa00' : '#00ff88'
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono w-8 text-right"
                  style={{
                    color: node.riskLevel >= 80 ? '#ff3b3b'
                      : node.riskLevel >= 60 ? '#ffaa00' : '#00ff88'
                  }}
                >
                  {node.riskLevel}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}