export default function KpiCard({ title, value, loading }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 w-full">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
      ) : (
        <>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </>
      )}
    </div>
  );
}