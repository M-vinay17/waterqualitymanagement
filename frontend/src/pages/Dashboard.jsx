import Header from "../components/Header";
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import SummaryCard from '../components/SummaryCard'
import WaterMap from '../components/WaterMap'
import WaterChart from '../components/WaterChart'
import ReportsTable from '../components/ReportsTable'

// Dashboard page assembling all components and providing dummy data
export default function Dashboard() {

  const [summary, setSummary] = useState({ totalReports: 128, activeAlerts: 4, stations: 12, verified: 95 })
  const [stations, setStations] = useState([])
  const [chartData, setChartData] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    // Example axios call structure for future API integration
    // axios.get('/api/dashboard').then(res => { ... })

    // Using dummy static JSON data for now
    const dummyStations = [
      { id: 1, name: 'North River', lat: 37.776, lng: -122.417, status: 'safe', ph: 7.4, turbidity: 0.8, do: 8.5 },
      { id: 2, name: 'Bay Edge', lat: 37.781, lng: -122.405, status: 'warning', ph: 6.6, turbidity: 3.1, do: 6.8 },
      { id: 3, name: 'Old Mill', lat: 37.769, lng: -122.432, status: 'contaminated', ph: 5.9, turbidity: 7.9, do: 3.7 },
    ]

    const dummyChart = [
      { day: 'Day -6', quality: 78 },
      { day: 'Day -5', quality: 80 },
      { day: 'Day -4', quality: 76 },
      { day: 'Day -3', quality: 74 },
      { day: 'Day -2', quality: 81 },
      { day: 'Day -1', quality: 83 },
      { day: 'Today', quality: 82 },
    ]

    const dummyReports = [
      { id: 'R-1001', location: 'North River', status: 'Verified', date: '2026-02-18' },
      { id: 'R-1002', location: 'Bay Edge', status: 'Pending', date: '2026-02-19' },
      { id: 'R-1003', location: 'Old Mill', status: 'Rejected', date: '2026-02-20' },
      { id: 'R-1004', location: 'South Creek', status: 'Verified', date: '2026-02-20' },
    ]

    // Simulate data fetch
    setStations(dummyStations)
    setChartData(dummyChart)
    setReports(dummyReports)

    // The summary could be derived from these datasets or fetched from API
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Total Reports"
            count={summary.totalReports}
            bg="bg-sky-500"
            textColor="text-white"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>}
          />

          <SummaryCard
            title="Active Alerts"
            count={summary.activeAlerts}
            bg="bg-amber-400"
            textColor="text-white"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3H3a1 1 0 000 2h14a1 1 0 000-2h-1V8a6 6 0 00-6-6z" /></svg>}
          />

          <SummaryCard
            title="Water Stations"
            count={summary.stations}
            bg="bg-emerald-500"
            textColor="text-white"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a1 1 0 001 1h3m10-12v10a1 1 0 01-1 1h-3" /></svg>}
          />

          <SummaryCard
            title="Verified Reports"
            count={summary.verified}
            bg="bg-indigo-500"
            textColor="text-white"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" /></svg>}
          />
        </section>

        {/* Main content grid: map + chart + reports */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WaterMap stations={stations} />

            <WaterChart data={chartData} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Reports</h2>
            <ReportsTable reports={reports} />
          </div>
        </section>
      </main>
    </div>
  )
}
