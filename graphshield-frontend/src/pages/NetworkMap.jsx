import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { networkApi } from '../api/api'
import { Server, Shield, Database, Monitor, Router, Wifi } from 'lucide-react'

const nodeTypeColors = {
  SERVER:      { bg: '#0d2137', border: '#00d4ff', text: '#00d4ff' },
  FIREWALL:    { bg: '#0d2a0d', border: '#00ff88', text: '#00ff88' },
  DATABASE:    { bg: '#2a1a0d', border: '#ffaa00', text: '#ffaa00' },
  ROUTER:      { bg: '#1a1a2a', border: '#8b5cf6', text: '#8b5cf6' },
  WORKSTATION: { bg: '#1a2a1a', border: '#6b7280', text: '#6b7280' },
  ADMIN:       { bg: '#2a0d0d', border: '#ff3b3b', text: '#ff3b3b' },
}

function getRiskColor(risk) {
  if (risk >= 80) return '#ff3b3b'
  if (risk >= 60) return '#ffaa00'
  return '#00ff88'
}

function buildFlowNodes(nodes) {
  const cols = 5
  return nodes.map((node, i) => {
    const colors = nodeTypeColors[node.nodeType] || nodeTypeColors.SERVER
    const riskColor = getRiskColor(node.riskLevel)
    return {
      id: String(node.nodeId),
      position: {
        x: (i % cols) * 220 + 50,
        y: Math.floor(i / cols) * 160 + 50
      },
      data: {
        label: (
          <div className="text-center p-1">
            <div className="text-xs font-bold truncate w-28" style={{ color: colors.text }}>
              {node.nodeName}
            </div>
            <div className="text-xs opacity-60 mt-1" style={{ color: colors.text }}>
              {node.nodeType}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: riskColor }} />
              <span className="text-xs" style={{ color: riskColor }}>{node.riskLevel}%</span>
            </div>
          </div>
        )
      },
      style: {
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        width: 150,
        fontSize: 12,
        color: colors.text,
      }
    }
  })
}

function buildFlowEdges(edges) {
  return edges.map(edge => ({
    id: String(edge.edgeId),
    source: String(edge.sourceId),
    target: String(edge.targetId),
    animated: false,
    style: { stroke: '#1e3a5f', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1e3a5f' },
    label: edge.weight,
    labelStyle: { fill: '#3a4a5c', fontSize: 10 },
  }))
}

export default function NetworkMap() {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([networkApi.getNodes(), networkApi.getEdges()]).then(([n, e]) => {
      setRfNodes(buildFlowNodes(n.data))
      setRfEdges(buildFlowEdges(e.data))
      setLoading(false)
    })
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-[#1e2d40] flex justify-between items-center">
        <div>
          <h2 className="text-[#00d4ff] font-mono font-bold text-lg tracking-wider">NETWORK TOPOLOGY MAP</h2>
          <p className="text-[#3a4a5c] text-xs font-mono">Live network graph — TechCorp Enterprise</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          {Object.entries(nodeTypeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.border }} />
              <span style={{ color: colors.text }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#00d4ff] font-mono animate-pulse">Loading network topology...</p>
        </div>
      ) : (
        <div className="flex-1">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background color="#1e2d40" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const risk = parseInt(n.data?.label?.props?.children?.[2]?.props?.children?.[1]?.props?.children) || 0
                return getRiskColor(risk)
              }}
              maskColor="rgba(10,14,26,0.8)"
            />
          </ReactFlow>
        </div>
      )}
    </div>
  )
}