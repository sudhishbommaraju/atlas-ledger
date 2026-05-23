export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F7F4EE] text-[#0B1220] font-sans">
      <nav className="w-64 border-r border-[rgba(11,18,32,0.10)] bg-white p-6">
        <h2 className="text-xl font-bold mb-8">Atlas Dashboard</h2>
        <ul className="space-y-4">
          <li><a href="/dashboard" className="text-[#5B6472] hover:text-[#1D4ED8] font-medium">Drift Events</a></li>
          <li><a href="/dashboard/state" className="text-[#5B6472] hover:text-[#1D4ED8] font-medium">Canonical State</a></li>
          <li><a href="/dashboard/audit" className="text-[#5B6472] hover:text-[#1D4ED8] font-medium">Audit & Remediation</a></li>
        </ul>
      </nav>
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
