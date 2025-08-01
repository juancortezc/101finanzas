'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ScatterChart, Scatter } from 'recharts'
import Navigation from '@/components/Navigation'

// Tipos para los datos de clientes
interface ClienteData {
  businessId: string
  businessName: string
  ingresos: number
  costos: number
  rentabilidad: number
  contribucionMarginal: number
  margenContribucion: number
  costPercentage: number
  costCentersCount: number
  costCenters: string[]
  percentageOfTotalIngresos: number
  percentageOfTotalCostos: number
  percentageOfTotalRentabilidad: number
  monthlyChart: {
    month: number
    monthName: string
    ingresos: number
    costos: number
    rentabilidad: number
    contribucionMarginal: number
    costPercentage: number
  }[]
}

interface ClientesApiResponse {
  success: boolean
  data: {
    year: number
    month: number
    period: string
    totalClients: number
    summary: {
      totalIngresos: number
      totalCostos: number
      totalRentabilidad: number
      totalContribucionMarginal: number
      averageCostPercentage: number
    }
    clients: ClienteData[]
  }
  error?: string
  timestamp: string
}

// Función para formatear números como moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Función para formatear porcentajes
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

// Colores para los gráficos
const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange  
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f59e0b'  // Amber
]

export default function ClientesPage() {
  const [clientesData, setClientesData] = useState<ClienteData[]>([])
  const [, setSummary] = useState<{
    totalIngresos: number
    totalCostos: number
    totalRentabilidad: number
    totalContribucionMarginal: number
    averageCostPercentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedMonth, setSelectedMonth] = useState(12)
  const [periodInfo, setPeriodInfo] = useState({ year: 2025, month: 12 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/clientes?year=${selectedYear}&month=${selectedMonth}`)
        const result: ClientesApiResponse = await response.json()
        
        if (result.success) {
          setClientesData(result.data.clients)
          setSummary(result.data.summary)
          setPeriodInfo({ year: result.data.year, month: result.data.month })
        } else {
          setError('Error al cargar los datos de clientes')
        }
      } catch (err) {
        setError('Error de conexión')
        console.error('Error fetching clientes data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-600 rounded-full animate-spin mx-auto" style={{animationDelay: '0.15s', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Cargando análisis de clientes...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Preparar datos para gráfico de pie
  const pieData = clientesData.slice(0, 8).map((client, index) => ({
    name: client.businessName,
    value: client.ingresos,
    percentage: client.percentageOfTotalIngresos,
    color: COLORS[index % COLORS.length]
  }))

  // Preparar datos para gráfico de barras horizontales de ingresos
  const ingresosBarData = clientesData.slice(0, 8).map(client => ({
    name: client.businessName,
    value: client.ingresos,
    displayValue: formatCurrency(client.ingresos)
  }))

  // Preparar datos para gráfico de contribución marginal
  const contribucionData = clientesData.slice(0, 8).map(client => ({
    name: client.businessName,
    value: client.contribucionMarginal,
    displayValue: formatCurrency(client.contribucionMarginal)
  }))

  // Preparar datos para gráfico de scatter de costo de venta
  const scatterData = clientesData.slice(0, 8).map((client, index) => ({
    x: index,
    y: client.costPercentage,
    name: client.businessName,
    size: client.ingresos / 10000 // Tamaño proporcional a ingresos
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Navigation />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  CLIENTES
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1 tracking-widest uppercase">
                  Mix de Clientes - Análisis Financiero
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-3">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <option value={1}>Enero</option>
                  <option value={2}>Febrero</option>
                  <option value={3}>Marzo</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Mayo</option>
                  <option value={6}>Junio</option>
                  <option value={7}>Julio</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Septiembre</option>
                  <option value={10}>Octubre</option>
                  <option value={11}>Noviembre</option>
                  <option value={12}>Diciembre</option>
                </select>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/30 shadow-lg">
                <p className="text-lg font-bold text-gray-900">
                  {periodInfo.year}-{periodInfo.month.toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {clientesData.length} clientes activos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Grid de Gráficos - Replicando el layout de la imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Gráfico de Pie - Ingresos por Cliente */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🥧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Ingresos por Cliente
              </h3>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percentage}) => `${name}: ${percentage.toFixed(1)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                    labelFormatter={(label) => `Cliente: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Barras Horizontales - Ingresos */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Ingresos por Cliente
              </h3>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={ingresosBarData} 
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ingresos']} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Contribución Marginal */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Contribución Marginal
              </h3>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={contribucionData} 
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Contribución Marginal']} />
                  <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Scatter - Costo de Venta */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Costo de Venta %
              </h3>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    domain={[-0.5, 7.5]}
                    tickFormatter={(value) => clientesData[Math.round(value)]?.businessName.substring(0, 8) || ''}
                    angle={-45}
                    textAnchor="end"
                    fontSize={10}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    domain={[0, 120]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`, 
                      'Costo de Venta'
                    ]}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        return `Cliente: ${payload[0].payload.name}`
                      }
                      return ''
                    }}
                  />
                  <Scatter data={scatterData} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Tabla Resumen de Clientes */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Resumen Detallado por Cliente
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Cliente</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Ingresos</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Rentabilidad</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Costos</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">CM</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">% Costos</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Programas</th>
                </tr>
              </thead>
              <tbody>
                {clientesData.map((client, index) => (
                  <tr key={client.businessId} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index === 0 ? 'bg-yellow-50/30' : ''}`}>
                    <td className="py-4 px-4 font-medium text-gray-900">{client.businessName}</td>
                    <td className="py-4 px-4 text-right text-gray-900">{formatCurrency(client.ingresos)}</td>
                    <td className={`py-4 px-4 text-right font-semibold ${client.rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(client.rentabilidad)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">{formatCurrency(client.costos)}</td>
                    <td className={`py-4 px-4 text-right font-semibold ${client.contribucionMarginal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(client.contribucionMarginal)}
                    </td>
                    <td className={`py-4 px-4 text-right font-bold ${client.costPercentage <= 70 ? 'text-green-600' : client.costPercentage <= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercentage(client.costPercentage)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {client.costCentersCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}