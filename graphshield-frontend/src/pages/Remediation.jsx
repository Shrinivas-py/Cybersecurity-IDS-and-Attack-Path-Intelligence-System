import { useEffect, useState } from 'react'
import { networkApi, attackApi, remediationApi } from '../api/api'
import { Wrench, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Remediation() {
  const [nodes, setNodes] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [actionType, setActionType] = useState('REMOVE_EDGE')
  const [sourceNode, setSourceNode] = useState('')
  const [targetNode, setTargetNode] = useState('')
  const [isolateNode, setIsolateNode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    networkApi.getNodes().then(r => setNodes(r.data))
  }, [])

  function addLog(msg, color = '#00d4ff') {
    setLog(prev => [...prev, { msg, color, time: new Date().toLocaleTimeString() }])
  }

  async function applyFix() {
    if (!sessionId) return
    setLoading(true)
    setResult(null)
    setLog([])

    addLog('Initiating remediation...', '#ffaa00')
    addLog(`Action: ${actionType}`, '#00d4ff')

    const payload = {
      sessionId: parseInt(sessionId),
      actionType,
      networkId: 1,
      ...(actionType === 'REMOVE_EDGE' ? {
        sourceNodeId: parseInt(sourceNode),
        targetNodeId: parseInt(targetNode),
      } : {
        nodeId: parseInt(isolateNode),
      })
    }

    try {
      const res = await remediationApi.apply(payload)
      setResult(res.data)
      addLog(res.data.targetReached
        ? '⚠ Attack path still exists — additional action needed'
        : '✓ Remediation successful — attack path blocked!',
        res.data.targetReached ? '#ffaa00' : '#00ff88'
      )
    } catch (e) {
      addLog('Error applying remediation', '#ff3b3b')
    }
    setLoading(false)
  }

  const getNodeName = (id) => nodes.find(n => n.nodeId === id)?.nodeName || `Node ${id}`

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#00ff88] font-mono tracking-wider">REMEDIATION PANEL</h2>
        <p className="text-[#3a4a5c] text-sm font-mono mt-1">Apply network fixes after attack detection</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6 space-y-4">
          <h3 className="text-[#00ff88] font-mono text-sm uppercase tracking-wider">Fix Configuration</h3>

          <div>
            <label className="text-[#3a4a5c] text-xs font-mono uppercase">Session ID</label>
            <input
              type="number"
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              placeholder="Enter session ID from attack sim..."
              className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#00ff88] outline-none"
            />
          </div>

          <div>
            <label className="text-[#3a4a5c] text-xs font-mono uppercase">Remediation Type</label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'REMOVE_EDGE',   label: 'Remove Edge',    desc: 'Cut connection between two nodes' },
                { value: 'ISOLATE_NODE',  label: 'Isolate Node',   desc: 'Quarantine a compromised device' },
              ].map(at => (
                <button
                  key={at.value}
                  onClick={() => setActionType(at.value)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    actionType === at.value
                      ? 'border-[#00ff88] bg-[#0d2a0d]'
                      : 'border-[#1e2d40] hover:border-[#3a4a5c]'
                  }`}
                >
                  <div className="text-[#e6edf3] text-sm font-mono">{at.label}</div>
                  <div className="text-[#3a4a5c] text-xs font-mono mt-1">{at.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {actionType === 'REMOVE_EDGE' ? (
            <div className="space-y-3">
              <div>
                <label className="text-[#3a4a5c] text-xs font-mono uppercase">Source Node</label>
                <select
                  value={sourceNode}
                  onChange={e => setSourceNode(e.target.value)}
                  className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#00ff88] outline-none"
                >
                  <option value="">Select source...</option>
                  {nodes.map(n => <option key={n.nodeId} value={n.nodeId}>[{n.nodeId}] {n.nodeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#3a4a5c] text-xs font-mono uppercase">Target Node</label>
                <select
                  value={targetNode}
                  onChange={e => setTargetNode(e.target.value)}
                  className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#00ff88] outline-none"
                >
                  <option value="">Select target...</option>
                  {nodes.map(n => <option key={n.nodeId} value={n.nodeId}>[{n.nodeId}] {n.nodeName}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[#3a4a5c] text-xs font-mono uppercase">Node to Isolate</label>
              <select
                value={isolateNode}
                onChange={e => setIsolateNode(e.target.value)}
                className="w-full mt-1 bg-[#0a0e1a] border border-[#1e2d40] rounded px-3 py-2 text-[#e6edf3] font-mono text-sm focus:border-[#00ff88] outline-none"
              >
                <option value="">Select node...</option>
                {nodes.map(n => <option key={n.nodeId} value={n.nodeId}>[{n.nodeId}] {n.nodeName}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={applyFix}
            disabled={loading || !sessionId}
            className="w-full py-3 bg-[#00ff88] hover:bg-[#00cc6a] disabled:bg-[#0d2a0d] disabled:text-[#1a5a1a] text-black font-mono font-bold rounded transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            {loading ? 'APPLYING FIX...' : 'APPLY REMEDIATION'}
          </button>
        </div>

        {/* Terminal */}
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-[#1e2d40] rounded-lg p-6">
            <h3 className="text-[#00ff88] font-mono text-sm uppercase tracking-wider mb-4">Remediation Log</h3>
            <div className="bg-[#050810] rounded p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
              {log.length === 0 ? (
                <p className="text-[#1e2d40]">{'>'} Awaiting remediation action...</p>
              ) : (
                log.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#3a4a5c]">[{l.time}]</span>
                    <span style={{ color: l.color }}>{l.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {result && (
            <div className={`bg-[#0d1117] border rounded-lg p-6 animate-fade-in ${
              result.targetReached ? 'border-[#ffaa00]' : 'border-[#00ff88]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.targetReached
                  ? <AlertTriangle className="w-6 h-6 text-[#ffaa00]" />
                  : <CheckCircle className="w-6 h-6 text-[#00ff88]" />
                }
                <h3 className="font-mono font-bold" style={{ color: result.targetReached ? '#ffaa00' : '#00ff88' }}>
                  {result.targetReached ? 'PARTIAL FIX — PATHS REMAIN' : 'SUCCESS — ATTACK BLOCKED'}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[#3a4a5c] text-xs font-mono uppercase mb-1">New Attack Path</p>
                  <div className="flex flex-wrap gap-1 items-center">
                    {result.bfsPath?.length > 0
                      ? result.bfsPath.map((nodeId, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="bg-[#0d2137] text-[#00d4ff] px-2 py-0.5 rounded text-xs font-mono border border-[#00d4ff33]">
                              {getNodeName(nodeId)}
                            </span>
                            {i < result.bfsPath.length - 1 && <ChevronRight className="w-3 h-3 text-[#3a4a5c]" />}
                          </span>
                        ))
                      : <span className="text-[#00ff88] font-mono text-xs">No path exists ✓</span>
                    }
                  </div>
                </div>

                <div>
                  <p className="text-[#3a4a5c] text-xs font-mono uppercase mb-1">Recommendations</p>
                  {result.recommendations?.map((r, i) => (
                    <p key={i} className="text-[#8b9bb4] text-xs font-mono">{r}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}