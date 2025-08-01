'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Navigation from '@/components/Navigation'

// Tipos para los datos de gastos
interface GastoData {
  id: string
  name: string
  formula: string
  currentValue: number
  previousValue: number
  difference: number
  percentageOfIncome: number
  monthlyChart: {
    month: number
    monthName: string
    value: number
  }[]
}

interface GastosApiResponse {
  success: boolean
  data: {
    year: number
    month: number
    previousYear: number
    ingresos: {
      current: number
      previous: number
    }
    gastos: GastoData[]
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

// Función para formatear diferencias
const formatDifference = (value: number) => {
  const formatted = formatCurrency(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

export default function GastosPage() {
  const [gastosData, setGastosData] = useState<GastoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedMonth, setSelectedMonth] = useState(12)
  const [yearInfo, setYearInfo] = useState({ year: 2025, month: 12, previousYear: 2024 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/gastos?year=${selectedYear}&month=${selectedMonth}`)
        const result: GastosApiResponse = await response.json()
        
        if (result.success) {
          setGastosData(result.data.gastos)
          setYearInfo({ year: result.data.year, month: result.data.month, previousYear: result.data.previousYear })
        } else {
          setError('Error al cargar los datos de gastos')
        }
      } catch (err) {
        setError('Error de conexión')
        console.error('Error fetching gastos data:', err)
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
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-red-600 rounded-full animate-spin mx-auto" style={{animationDelay: '0.15s', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Cargando gastos...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Navigation />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
                  GASTOS
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1 tracking-widest uppercase">
                  Análisis Detallado
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg transition-all duration-200 hover:shadow-xl"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Grid de Cards de Gastos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {gastosData.map((gasto, index) => (
            <div 
              key={gasto.id} 
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              
              {/* Header del Card */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">📉</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    {gasto.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 font-mono bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200">
                  {gasto.formula}
                </p>
              </div>

              {/* Valores principales en grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                
                {/* Valor 2025 */}
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {yearInfo.year}
                  </p>
                  <p className="text-xl font-light text-black">
                    {formatCurrency(gasto.currentValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(gasto.percentageOfIncome)}
                  </p>
                </div>

                {/* Valor 2024 */}
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {yearInfo.previousYear}
                  </p>
                  <p className="text-lg font-light text-gray-700">
                    {formatCurrency(gasto.previousValue)}
                  </p>
                </div>

                {/* Diferencia */}
                <div className="text-center bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-3 border border-yellow-200 shadow-lg">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                    DIF
                  </p>
                  <p className={`text-lg font-bold ${
                    gasto.difference >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatDifference(gasto.difference)}
                  </p>
                </div>

                {/* Indicador visual */}
                <div className="flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${
                    gasto.percentageOfIncome <= 5 ? 'bg-green-500' :
                    gasto.percentageOfIncome <= 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>

              </div>

              {/* Gráfico de línea mensual */}
              {gasto.monthlyChart.length > 0 && (
                <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    Comportamiento Mensual {yearInfo.year}
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gasto.monthlyChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis 
                          dataKey="monthName" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [
                            formatCurrency(value),
                            gasto.name
                          ]}
                          labelFormatter={(label) => `${label}`}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 4, fill: '#ef4444' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Resumen Total */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Resumen Total de Gastos
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Total {yearInfo.year}
              </p>
              <p className="text-2xl font-light text-black">
                {formatCurrency(gastosData.reduce((sum, gasto) => sum + gasto.currentValue, 0))}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Total {yearInfo.previousYear}
              </p>
              <p className="text-xl font-light text-gray-700">
                {formatCurrency(gastosData.reduce((sum, gasto) => sum + gasto.previousValue, 0))}
              </p>
            </div>
            
            <div className="text-center bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">
                Diferencia Total
              </p>
              <p className={`text-2xl font-bold ${
                gastosData.reduce((sum, gasto) => sum + gasto.difference, 0) >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatDifference(gastosData.reduce((sum, gasto) => sum + gasto.difference, 0))}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                % de Ingresos
              </p>
              <p className="text-xl font-semibold text-blue-700">
                {formatPercentage(gastosData.reduce((sum, gasto) => sum + gasto.percentageOfIncome, 0))}
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}