import React from 'react'

// Reusable summary card used in the Dashboard summary section
export default function SummaryCard({ title, count, icon, bg = 'bg-white', textColor = 'text-white' }) {
  return (
    <div className={`p-4 rounded-lg shadow-sm transform transition hover:-translate-y-1 ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm font-medium ${textColor}`}>{title}</div>
          <div className={`mt-2 text-2xl font-semibold ${textColor}`}>{count}</div>
        </div>
        <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  )
}
