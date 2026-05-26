import { Shield, Activity, Network, Zap, Wrench, Terminal } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/',           icon: Activity,  label: 'Dashboard',    color: '#00d4ff' },
  { path: '/network',    icon: Network,   label: 'Network Map',  color: '#00d4ff' },
  { path: '/attack',     icon: Zap,       label: 'Attack Sim',   color: '#ff3b3b' },
  { path: '/analysis',   icon: Terminal,  label: 'Analysis',     color: '#ffaa00' },
  { path: '/remediate',  icon: Wrench,    label: 'Remediation',  color: '#00ff88' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="w-64 h-screen bg-[#0d1117] border-r border-[#1e2d40] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e2d40]">
        <div className="flex items-center gap-3">
          <Shield className="text-[#00d4ff] w-8 h-8" />
          <div>
            <h1 className="text-[#00d4ff] font-bold text-lg tracking-wider">GRAPHSHIELD</h1>
            <p className="text-[#3a4a5c] text-xs">Network IDS v1.0</p>
          </div>
        </div>
        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
          <span className="text-[#00ff88] text-xs font-mono">SYSTEM ACTIVE</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label, color }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                ${active
                  ? 'bg-[#1e2d40] border border-[#00d4ff33]'
                  : 'hover:bg-[#1a2332] border border-transparent'
                }`}
            >
              <Icon
                style={{ color: active ? color : '#3a4a5c' }}
                className="w-5 h-5 transition-colors"
              />
              <span
                style={{ color: active ? color : '#8b9bb4' }}
                className="text-sm font-mono tracking-wide transition-colors"
              >
                {label}
              </span>
              {active && (
                <div
                  style={{ backgroundColor: color }}
                  className="ml-auto w-1 h-4 rounded-full"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e2d40]">
        <div className="text-[#3a4a5c] text-xs font-mono space-y-1">
          <p>Network: TechCorp Enterprise</p>
          <p>Nodes: 22 | Edges: 41</p>
          <p className="text-[#ff3b3b] animate-blink">● MONITORING ACTIVE</p>
        </div>
      </div>
    </div>
  )
}