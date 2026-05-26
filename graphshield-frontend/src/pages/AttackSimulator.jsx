import { useEffect, useState } from 'react'
import { networkApi, attackApi } from '../api/api'
import { Zap, AlertTriangle, ChevronRight } from 'lucide-react'

const attackTypes = [
  { value: 'DIJKSTRA', label: 'Shortest Path Attack', desc: 'Finds easiest route using Dijkstra' },
  { value: 'BFS', label: 'Spread Attack (BFS)', desc: 'Virus/worm spreading layer by layer' },
  { value: 'DFS', label: 'Brute Force (DFS)', desc: 'Tries all possible attack paths' },
]
export default function AttackSimulator() {
  const [nodes, setNodes] = useState([])
  const [attackerNode, setAttackerNode] = useState('')
  const [targetNode, setTargetNode] = useState('')
  const [attackType, setAttackType] = useState('SHORTEST_PATH')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    networkApi.getNodes().then(r => setNodes(r.data))
  }, [])

  function addLog(msg, color = '#00d4ff') {
    setLog(prev => [...prev, { msg, color, time: new Date().toLocaleTimeString() }])
  }

  async function simulate() {
    if (!attackerNode || !targetNode) return
    setLoading(true)
    setResult(null)
    setLog([])

    addLog('Initializing attack simulation...', '#ffaa00')
    addLog(`Attacker: Node ${attackerNode}`, '#ff3b3b')
    addLog(`Target: Node ${targetNode}`, '#ff3b3b')
    addLog(`Attack Type: ${attackType}`, '#ffaa00')
    addLog('Running graph algorithms...', '#00d4ff')

    try {
      const res = await attackApi.simulate({
        attackerNodeId: parseInt(attackerNode),
        targetNodeId: parseInt(targetNode),
        attackType,
        networkId: 1
      })
      setResult(res.data)
      addLog(res.data.targetReached
        ? '⚠ TARGET REACHED — INTRUSION DETECTED!'
        : '✓ Attack blocked — target not reachable',
        res.data.targetReached ? '#ff3b3b' : '#00ff88'
      )
      addLog(`Risk Score: ${res.data.riskScore}/100`, '#ffaa00')
    } catch (e) {
      addLog('Error running simulation', '#ff3b3b')
    }
    setLoading(false)
  }

  const getNodeName = (id) => nodes.find(n => n.nodeId === id)?.nodeName || `Node ${id}`

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#ff3b3b] font-mono tracking-wider">ATTACK SIMULATOR</h2>
        <p className="text-[#3a4a5c] text-sm font-mono mt-1">Simulate network intrusion scenarios</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6 space-y-4">
            <h3 className="text-[#00d4ff] font-mono text-sm uppercase tracking-wider">Attack Configuration</h3>

            <div>
              <label className="text-[#3a4a5c] text-xs font-mono uppercase">Attacker Node</label>
              <select
                value={attackerNode}
                onChange={e => setAttackerNode(e.target.value)}
                className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#ff3b3b] outline-none"
              >
                <option value="">Select attacker...</option>
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    [{n.nodeId}] {n.nodeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#3a4a5c] text-xs font-mono uppercase">Target Node</label>
              <select
                value={targetNode}
                onChange={e => setTargetNode(e.target.value)}
                className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#ff3b3b] outline-none"
              >
                <option value="">Select target...</option>
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    [{n.nodeId}] {n.nodeName} (Risk: {n.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#3a4a5c] text-xs font-mono uppercase">Attack Type</label>
              <div className="mt-2 space-y-2">
                {attackTypes.map(at => (
                  <button
                    key={at.value}
                    onClick={() => setAttackType(at.value)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      attackType === at.value
                        ? 'border-[#ff3b3b] bg-[#2a0d0d]'
                        : 'border-[#1e2d40] hover:border-[#3a4a5c]'
                    }`}
                  >
                    <div className="text-[#e6edf3] text-sm font-mono">{at.label}</div>
                    <div className="text-[#3a4a5c] text-xs font-mono mt-1">{at.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={simulate}
              disabled={loading || !attackerNode || !targetNode}
              className="w-full py-3 bg-[#ff3b3b] hover:bg-[#ff5555] disabled:bg-[#3a1a1a] disabled:text-[#5a2a2a] text-white font-mono font-bold rounded transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'SIMULATING...' : 'LAUNCH ATTACK'}
            </button>
          </div>
        </div>

        {/* Terminal Log */}
        <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6">
          <h3 className="text-[#00d4ff] font-mono text-sm uppercase tracking-wider mb-4">
            Attack Terminal
          </h3>
          <div className="bg-[#050810] rounded p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
            {log.length === 0 ? (
              <p className="text-[#1e2d40]">{'>'} Awaiting attack simulation...</p>
            ) : (
              log.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#3a4a5c]">[{l.time}]</span>
                  <span style={{ color: l.color }}>{l.msg}</span>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-2">
                <span className="text-[#3a4a5c]">{'>'}</span>
                <span className="text-[#00d4ff] animate-pulse">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${
            result.targetReached
              ? 'bg-[#2a0d0d] border-[#ff3b3b]'
              : 'bg-[#0d2a0d] border-[#00ff88]'
          }`}>
            <AlertTriangle
              className="w-6 h-6"
              style={{ color: result.targetReached ? '#ff3b3b' : '#00ff88' }}
            />
            <div>
              <p className="font-mono font-bold" style={{ color: result.targetReached ? '#ff3b3b' : '#00ff88' }}>
                {result.targetReached ? '⚠ INTRUSION DETECTED' : '✓ NETWORK SECURE'}
              </p>
              <p className="text-xs font-mono text-[#3a4a5c]">
                Session ID: {result.sessionId} | Risk Score: {result.riskScore}/100
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* BFS Path */}
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4">
              <h4 className="text-[#00d4ff] font-mono text-xs uppercase mb-3">BFS Path (Shortest Hops)</h4>
              <div className="flex flex-wrap gap-1 items-center">
                {result.bfsPath?.map((nodeId, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-[#0d2137] border border-[#00d4ff33] text-[#00d4ff] px-2 py-1 rounded text-xs font-mono">
                      {getNodeName(nodeId)}
                    </span>
                    {i < result.bfsPath.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-[#3a4a5c]" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Dijkstra Path */}
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4">
              <h4 className="text-[#ffaa00] font-mono text-xs uppercase mb-3">
                Easiest Path (Cost: {result.totalAttackCost?.toFixed(2)})
              </h4>
              <div className="flex flex-wrap gap-1 items-center">
                {result.easiestPath?.map((nodeId, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-[#2a1a0d] border border-[#ffaa0033] text-[#ffaa00] px-2 py-1 rounded text-xs font-mono">
                      {getNodeName(nodeId)}
                    </span>
                    {i < result.easiestPath.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-[#3a4a5c]" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Nodes */}
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4">
              <h4 className="text-[#ff3b3b] font-mono text-xs uppercase mb-3">Critical Nodes (AP)</h4>
              <div className="flex flex-wrap gap-1">
                {result.criticalNodes?.map(nodeId => (
                  <span key={nodeId} className="bg-[#2a0d0d] border border-[#ff3b3b33] text-[#ff3b3b] px-2 py-1 rounded text-xs font-mono">
                    {getNodeName(nodeId)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* All Paths */}
          <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4">
            <h4 className="text-[#8b5cf6] font-mono text-xs uppercase mb-3">
              All Attack Paths ({result.allAttackPaths?.length} found)
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.allAttackPaths?.map((path, i) => (
                <div key={i} className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-[#3a4a5c] w-6">#{i+1}</span>
                  {path.map((nodeId, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className="text-[#8b5cf6]">{getNodeName(nodeId)}</span>
                      {j < path.length - 1 && <ChevronRight className="w-3 h-3 text-[#3a4a5c]" />}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4">
            <h4 className="text-[#00ff88] font-mono text-xs uppercase mb-3">Recommendations</h4>
            <div className="space-y-2">
              {result.recommendations?.map((rec, i) => (
                <p key={i} className="text-sm font-mono text-[#8b9bb4]">{rec}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}