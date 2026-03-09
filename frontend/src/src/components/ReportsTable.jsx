import React from 'react'

// Recent reports table with status badges
export default function ReportsTable({ reports }) {
  const badgeFor = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800'
    if (status === 'Verified') return 'bg-green-100 text-green-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Report ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {reports.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{r.id}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{r.location}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeFor(r.status)}`}>{r.status}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
