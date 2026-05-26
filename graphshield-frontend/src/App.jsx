import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NetworkMap from './pages/NetworkMap'
import AttackSimulator from './pages/AttackSimulator'
import Analysis from './pages/Analysis'
import Remediation from './pages/Remediation'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0a0e1a] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/network"   element={<NetworkMap />} />
            <Route path="/attack"    element={<AttackSimulator />} />
            <Route path="/analysis"  element={<Analysis />} />
            <Route path="/remediate" element={<Remediation />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}