'use client';

const weeklyData = [
  { day: 'Sen', value: 120 },
  { day: 'Sel', value: 180 },
  { day: 'Rab', value: 150 },
  { day: 'Kam', value: 220 },
  { day: 'Jum', value: 190 },
  { day: 'Sab', value: 280 },
  { day: 'Min', value: 160 },
];

export function ShipmentChart() {
  const maxValue = Math.max(...weeklyData.map((d) => d.value));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Pengiriman Mingguan (Kg)</h3>
      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end gap-2">
          {weeklyData.map((data, index) => {
            const height = (data.value / maxValue) * (chartHeight - 30);
            return (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{data.value}</span>
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500"
                  style={{ height: `${height}px` }}
                />
                <span className="text-xs text-gray-500">{data.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}