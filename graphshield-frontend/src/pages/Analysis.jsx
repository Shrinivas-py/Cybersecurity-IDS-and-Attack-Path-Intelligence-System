import { useState, useEffect } from 'react'
import { attackApi, networkApi } from '../api/api'
import { Terminal, Activity, Shield, GitBranch } from 'lucide-react'

export default function Analysis() {
  const [nodes, setNodes] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    networkApi.getNodes().then(r => setNodes(r.data))
    // Load recent attack sessions
    attackApi.getSessions?.().then(r => setSessions(r.data)).catch(() => {})
  }, [])

  const getNodeName = (id) => nodes.find(n => n.nodeId === id)?.nodeName || `Node ${id}`

  async function runAnalysis() {
    setLoading(true)
    try {
      // Run a full simulation with default params to get analysis data
      const res = await attackApi.simulate({
        attackerNodeId: 1,
        targetNodeId: nodes[nodes.length - 1]?.nodeId || 2,
        attackType: 'DIJKSTRA',
        networkId: 1
      })
      setResult(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#ffaa00] font-mono tracking-wider">ANALYSIS REPORT</h2>
          <p className="text-[#3a4a5c] text-sm font-mono mt-1">Deep dive into algorithm results</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-[#ffaa00] hover:bg-[#ffbb33] disabled:bg-[#3a2a00] text-black font-mono font-bold rounded transition-all flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          {loading ? 'ANALYZING...' : 'RUN ANALYSIS'}
        </button>
      </div>

      {!result ? (
        <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-12 flex flex-col items-center justify-center gap-4">
          <Terminal className="w-16 h-16 text-[#1e2d40]" />
          <p className="text-[#3a4a5c] font-mono text-sm">Click "Run Analysis" to generate report</p>
          <p className="text-[#3a4a5c] font-mono text-xs">Runs all 5 algorithms and displays results</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4 text-center">
              <p className="text-[#3a4a5c] font-mono text-xs uppercase">Risk Score</p>
              <p className={`text-3xl font-bold font-mono mt-1 ${
                result.riskScore > 70 ? 'text-[#ff3b3b]' :
                result.riskScore > 40 ? 'text-[#ffaa00]' : 'text-[#00ff88]'
              }`}>{result.riskScore}/100</p>
            </div>
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4 text-center">
              <p className="text-[#3a4a5c] font-mono text-xs uppercase">Attack Paths</p>
              <p className="text-3xl font-bold font-mono mt-1 text-[#8b5cf6]">{result.allAttackPaths?.length || 0}</p>
            </div>
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4 text-center">
              <p className="text-[#3a4a5c] font-mono text-xs uppercase">Critical Nodes</p>
              <p className="text-3xl font-bold font-mono mt-1 text-[#ff3b3b]">{result.criticalNodes?.length || 0}</p>
            </div>
            <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-4 text-center">
              <p className="text-[#3a4a5c] font-mono text-xs uppercase">SCCs Found</p>
              <p className="text-3xl font-bold font-mono mt-1 text-[#ffaa00]">{result.stronglyConnectedComponents?.length || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">

            {/* Articulation Points */}
            <div className="bg-[#0d1117] border border-[#ff3b3b33] rounded-lg p-6">
              <h3 className="text-[#ff3b3b] font-mono text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Articulation Points
              </h3>
              <p className="text-[#3a4a5c] font-mono text-xs mb-4">Nodes whose removal disconnects the network</p>
              <div className="flex flex-wrap gap-2">
                {result.criticalNodes?.length === 0 ? (
                  <p className="text-[#3a4a5c] font-mono text-xs">No articulation points found</p>
                ) : (
                  result.criticalNodes?.map(nodeId => (
                    <div key={nodeId} className="bg-[#2a0d0d] border border-[#ff3b3b55] rounded px-3 py-2 text-center">
                      <p className="text-[#ff3b3b] font-mono text-sm font-bold">{getNodeName(nodeId)}</p>
                      <p className="text-[#ff3b3b88] font-mono text-xs">Node {nodeId}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tarjan SCC */}
            <div className="bg-[#0d1117] border border-[#8b5cf633] rounded-lg p-6">
              <h3 className="text-[#8b5cf6] font-mono text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Tarjan SCC
              </h3>
              <p className="text-[#3a4a5c] font-mono text-xs mb-4">Strongly connected components in the network</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.stronglyConnectedComponents?.map((scc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#3a4a5c] font-mono text-xs w-10 pt-1">SCC{i + 1}</span>
                    <div className="flex gap-1 flex-wrap">
                      {scc.map(nodeId => (
                        <span key={nodeId} className="bg-[#1a1a2a] border border-[#8b5cf633] text-[#8b5cf6] px-2 py-0.5 rounded text-xs font-mono">
                          {getNodeName(nodeId)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BFS Levels */}
            <div className="bg-[#0d1117] border border-[#00d4ff33] rounded-lg p-6">
              <h3 className="text-[#00d4ff] font-mono text-sm uppercase tracking-wider mb-1">BFS Traversal Levels</h3>
              <p className="text-[#3a4a5c] font-mono text-xs mb-4">Distance of each node from attacker</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.bfsLevels && Object.entries(result.bfsLevels)
                  .sort((a, b) => a[1] - b[1])
                  .map(([nodeId, level]) => (
                    <div key={nodeId} className="flex items-center gap-3">
                      <span className="text-[#3a4a5c] font-mono text-xs w-14">Lvl {level}</span>
                      <div className="flex-1 bg-[#1e2d40] rounded-full h-1.5">
                        <div
                          className="bg-[#00d4ff] h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (level + 1) * 15)}%` }}
                        />
                      </div>
                      <span className="text-[#00d4ff] font-mono text-xs w-32 text-right">{getNodeName(parseInt(nodeId))}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* All DFS Paths */}
            <div className="bg-[#0d1117] border border-[#8b5cf633] rounded-lg p-6">
              <h3 className="text-[#8b5cf6] font-mono text-sm uppercase tracking-wider mb-1">
                All Attack Paths (DFS)
              </h3>
              <p className="text-[#3a4a5c] font-mono text-xs mb-4">{result.allAttackPaths?.length} paths found</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.allAttackPaths?.map((path, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs font-mono flex-wrap">
                    <span className="text-[#3a4a5c] w-6">#{i + 1}</span>
                    {path.map((nodeId, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <span className="text-[#8b5cf6]">{getNodeName(nodeId)}</span>
                        {j < path.length - 1 && <span className="text-[#3a4a5c]">›</span>}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#0d1117] border border-[#00ff8833] rounded-lg p-6">
            <h3 className="text-[#00ff88] font-mono text-sm uppercase tracking-wider mb-4">Recommendations</h3>
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