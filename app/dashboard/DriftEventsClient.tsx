"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/insforge/client';
import { DriftEvent } from '@/lib/insforge/db';

import { useRouter } from 'next/navigation';

const severityOrder: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };

export default function DriftEventsClient({ initialEvents, companyName, confidenceScore, companyId }: any) {
  const [selectedEvent, setSelectedEvent] = useState<DriftEvent | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Fallback: poll server component for fresh data every 5 seconds since InsForge SDK 
    // lacks the exact .channel() API.
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  const events = initialEvents; // Server component provides the latest state directly

  const sortedEvents = [...events].filter(e => e.status === 'open').sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));
  
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getSeverityBadge = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };
  
  const formatDetector = (type: string) => type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1220]">{companyName}</h1>
          <div className="text-sm text-[#5B6472] mt-1">Operational Control Layer</div>
        </div>
        <div className="flex gap-4 items-center">
          <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${getScoreColor(confidenceScore)}`}>
            <span>Confidence Score:</span>
            <span>{(confidenceScore * 100).toFixed(0)}%</span>
          </div>
          <div className="bg-white border border-[rgba(11,18,32,0.10)] px-4 py-2 rounded-lg font-bold shadow-sm">
            {sortedEvents.length} Open Events
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-[rgba(11,18,32,0.10)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1EDE5] border-b border-[rgba(11,18,32,0.10)]">
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Detector</th>
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Severity</th>
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Description</th>
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Systems</th>
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Detected</th>
              <th className="p-4 font-semibold text-[#0B1220] text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[#5B6472]">Atlas is observing your payout stack. No active drift detected.</td></tr>
            ) : (
              sortedEvents.map(evt => (
                <tr key={evt.id} className="border-b border-[rgba(11,18,32,0.10)] hover:bg-[#F7F4EE] transition-colors">
                  <td className="p-4 text-sm font-medium">{formatDetector(evt.detector_type)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(evt.severity)} uppercase tracking-wider`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="p-4 text-sm max-w-xs truncate" title={evt.description}>{evt.description}</td>
                  <td className="p-4 text-sm">{evt.affected_systems.join(', ')}</td>
                  <td className="p-4 text-sm text-[#5B6472]">{new Date(evt.detected_at).toLocaleTimeString()}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedEvent(evt)}
                      className="text-[#1D4ED8] hover:text-blue-800 text-sm font-semibold underline"
                    >
                      View remediation
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Side Panel */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-auto border-l border-[rgba(11,18,32,0.10)] animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Remediation Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="mb-6">
              <div className="text-xs text-[#5B6472] uppercase font-bold mb-1">Detector</div>
              <div className="font-semibold text-lg">{formatDetector(selectedEvent.detector_type)}</div>
            </div>
            
            <div className="mb-6">
              <div className="text-xs text-[#5B6472] uppercase font-bold mb-1">Issue</div>
              <div className="text-[#0B1220] bg-red-50 p-3 rounded border border-red-100">{selectedEvent.description}</div>
            </div>
            
            <div className="mb-6">
              <div className="text-xs text-[#5B6472] uppercase font-bold mb-1">Recommended Action</div>
              <div className="text-[#0B1220] bg-blue-50 p-3 rounded border border-blue-100">{selectedEvent.recommended_action}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <div className="text-xs text-[#5B6472] uppercase font-bold mb-1">Risk Exposure</div>
                <div className="font-mono text-red-600 font-bold">${(selectedEvent.dollars_at_risk / 100).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-[#5B6472] uppercase font-bold mb-1">Confidence</div>
                <div className="font-bold">{(selectedEvent.confidence_score * 100).toFixed(0)}%</div>
              </div>
            </div>
            
            <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed border border-gray-300 shadow-inner">
              Remediation execution requires live payout permissions.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
