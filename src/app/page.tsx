'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts'
import Image from 'next/image'

// Tipos para los datos del dashboard
interface KPIData {
  period: string
  year: number
  month: number
  kpis: {
    totalIncome: number
    totalCosts: number
    totalProfit: number
    costPercentage: number
    profitMargin: number
    
    // Año anterior
    yearAgoIncome: number
    yearAgoCosts: number
    yearAgoProfit: number
    
    // Variaciones año anterior
    incomeVariationYear: number
    profitVariationYear: number
    costsVariationYear: number
    
    // Mes anterior
    previousIncome: number
    previousCosts: number
    previousProfit: number
    incomeVariationMonth: number
    profitVariationMonth: number
    costsVariationMonth: number
  }
  metadata: {
    totalEntries: number
    uniqueAccounts: number
    accountBreakdown: {
      income: number
      costs: number
      profit: number
    }
  }
}

interface ApiResponse {
  success: boolean
  data: KPIData
  timestamp: string
}

interface TrendData {
  month: number
  monthName: string
  period: string
  ingresos: number
  costos: number
  rentabilidad: number
  hasData: boolean
  costoDirectoPercentage?: number
}

interface TrendsApiResponse {
  success: boolean
  data: {
    year: number
    trends: TrendData[]
    summary: {
      totalMonths: number
      avgIncome: number
      avgCosts: number
      avgProfit: number
    }
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

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [trendsData, setTrendsData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Cargar KPIs y tendencias en paralelo
        const [kpisResponse, trendsResponse] = await Promise.all([
          fetch('/api/dashboard/kpis?year=2025&month=6'),
          fetch('/api/dashboard/trends?year=2025')
        ])
        
        const kpisResult: ApiResponse = await kpisResponse.json()
        const trendsResult: TrendsApiResponse = await trendsResponse.json()
        
        if (kpisResult.success) {
          setKpiData(kpisResult.data)
        } else {
          setError('Error al cargar los KPIs')
        }
        
        if (trendsResult.success) {
          setTrendsData(trendsResult.data.trends)
        } else {
          console.warn('Error al cargar tendencias:', trendsResult.error)
        }
      } catch (err) {
        setError('Error de conexión')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !kpiData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error</p>
          <p>{error || 'No se pudieron cargar los datos'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header - Profesional con logo */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image 
                src="/logo-101grados.png" 
                alt="101 Grados Logo" 
                width={120} 
                height={60}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  Dashboard Financiero
                </h1>
                <p className="text-cyan-400 text-base font-medium mt-1">
                  Marketing Relacional
                </p>
              </div>
            </div>
            <div className="text-right bg-slate-700/50 rounded-xl px-6 py-4 border border-slate-600/50">
              <p className="text-xl font-semibold text-white">
                {kpiData.period}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {kpiData.metadata.totalEntries.toLocaleString()} movimientos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KPIs Principales - Profesional y Compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Ingresos */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"></div>
                <p className="text-base font-semibold text-white uppercase tracking-wider">
                  Ingresos
                </p>
              </div>
              <p className="text-sm text-cyan-400 mb-4">
                Code 4
              </p>
              <p className="text-4xl font-bold text-white mb-6">
                {formatCurrency(kpiData.kpis.totalIncome)}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-slate-300">Año anterior</span>
                  <span className="font-semibold text-slate-100">
                    {formatCurrency(kpiData.kpis.yearAgoIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Variación</span>
                  <span className={`text-base font-bold px-3 py-2 rounded-lg ${
                    kpiData.kpis.incomeVariationYear >= 0 
                      ? 'text-green-300 bg-green-900/40 border border-green-600/30' 
                      : 'text-red-300 bg-red-900/40 border border-red-600/30'
                  }`}>
                    {kpiData.kpis.incomeVariationYear >= 0 ? '+' : ''}
                    {formatPercentage(kpiData.kpis.incomeVariationYear)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Costos */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-lime-500/50 shadow-xl hover:shadow-lime-500/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-lime-400 to-lime-500 rounded-full"></div>
                <p className="text-base font-semibold text-white uppercase tracking-wider">
                  Costos
                </p>
              </div>
              <p className="text-sm text-lime-400 mb-4">
                Code 5.1
              </p>
              <p className="text-4xl font-bold text-white mb-6">
                {formatCurrency(kpiData.kpis.totalCosts)}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-slate-300">Año anterior</span>
                  <span className="font-semibold text-slate-100">
                    {formatCurrency(kpiData.kpis.yearAgoCosts)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Variación</span>
                  <span className={`text-base font-bold px-3 py-2 rounded-lg ${
                    kpiData.kpis.costsVariationYear <= 0 
                      ? 'text-green-300 bg-green-900/40 border border-green-600/30' 
                      : 'text-red-300 bg-red-900/40 border border-red-600/30'
                  }`}>
                    {kpiData.kpis.costsVariationYear >= 0 ? '+' : ''}
                    {formatPercentage(kpiData.kpis.costsVariationYear)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">% de ingresos</span>
                    <span className={`text-base font-bold px-3 py-2 rounded-lg ${
                      kpiData.kpis.costPercentage <= 60 
                        ? 'text-green-300 bg-green-900/40 border border-green-600/30' 
                        : 'text-amber-300 bg-amber-900/40 border border-amber-600/30'
                    }`}>
                      {formatPercentage(kpiData.kpis.costPercentage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rentabilidad */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full"></div>
                <p className="text-base font-semibold text-white uppercase tracking-wider">
                  Rentabilidad
                </p>
              </div>
              <p className="text-sm text-cyan-400 mb-4">
                Code 6
              </p>
              <p className="text-4xl font-bold text-white mb-6">
                {formatCurrency(kpiData.kpis.totalProfit)}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-slate-300">Año anterior</span>
                  <span className="font-semibold text-slate-100">
                    {formatCurrency(kpiData.kpis.yearAgoProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Variación</span>
                  <span className={`text-base font-bold px-3 py-2 rounded-lg ${
                    kpiData.kpis.profitVariationYear >= 0 
                      ? 'text-green-300 bg-green-900/40 border border-green-600/30' 
                      : 'text-red-300 bg-red-900/40 border border-red-600/30'
                  }`}>
                    {kpiData.kpis.profitVariationYear >= 0 ? '+' : ''}
                    {formatPercentage(kpiData.kpis.profitVariationYear)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Margen</span>
                    <span className="text-base font-bold text-cyan-300 bg-cyan-900/40 border border-cyan-600/30 px-3 py-2 rounded-lg">
                      {formatPercentage(kpiData.kpis.profitMargin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos - Tendencias y Costo Directo */}
        {trendsData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            
            {/* Gráfico de Tendencias Mensuales */}
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full"></div>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  Tendencias Mensuales 2025
                </h3>
              </div>
              
              <div className="h-72 bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="monthName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value),
                        name === 'ingresos' ? 'Ingresos' : 
                        name === 'costos' ? 'Costos' : 'Rentabilidad'
                      ]}
                      labelFormatter={(label) => `Mes: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', color: '#94a3b8' }}
                      formatter={(value) => 
                        value === 'ingresos' ? 'Ingresos' : 
                        value === 'costos' ? 'Costos' : 'Rentabilidad'
                      }
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#22d3ee" 
                      strokeWidth={3}
                      dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#22d3ee' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costos" 
                      stroke="#84cc16" 
                      strokeWidth={3}
                      dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#84cc16' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rentabilidad" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Barras - Costo Directo */}
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-lime-400 to-amber-400 rounded-full"></div>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  Costo Directo (5.1/4)
                </h3>
              </div>
              
              <div className="h-72 bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="monthName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value.toFixed(1)}%`,
                        'Costo Directo'
                      ]}
                      labelFormatter={(label) => `Mes: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    
                    {/* Línea de tendencia punteada */}
                    <ReferenceLine 
                      stroke="#64748b" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      y={trendsData.reduce((sum, item) => sum + (item.costoDirectoPercentage || 0), 0) / trendsData.length}
                      label={{ value: "Promedio", position: "top", fill: "#64748b" }}
                    />
                    
                    <Bar 
                      dataKey="costoDirectoPercentage" 
                      fill="#84cc16"
                      radius={[4, 4, 0, 0]}
                      label={{
                        position: 'top',
                        fill: '#ffffff',
                        fontSize: 14,
                        fontWeight: 'bold',
                        formatter: (value: unknown) => `${parseFloat(String(value)).toFixed(1)}%`
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Cards Resumen Mensual - 6 por línea */}
        {trendsData.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-lime-400 to-cyan-400 rounded-full"></div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Resumen Mensual por Período
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendsData.map((trend, index) => (
                <div 
                  key={trend.period} 
                  className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                      {trend.monthName}
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-slate-400">I:</span>
                        <span className="ml-2 font-semibold text-cyan-300">
                          {formatCurrency(trend.ingresos)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">C:</span>
                        <span className="ml-2 font-semibold text-lime-300">
                          {formatCurrency(trend.costos)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">R:</span>
                        <span className="ml-2 font-semibold text-green-300">
                          {formatCurrency(trend.rentabilidad)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen Financiero - Profesional */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full"></div>
            <h3 className="text-xl font-semibold text-white tracking-tight">
              Resumen Financiero
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-base font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Rendimiento Actual
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Ingresos totales</span>
                  <span className="font-semibold text-white text-lg">{formatCurrency(kpiData.kpis.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Costos totales</span>
                  <span className="font-semibold text-white text-lg">{formatCurrency(kpiData.kpis.totalCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-600/50">
                  <span className="text-slate-300 font-semibold">Utilidad neta</span>
                  <span className="font-bold text-cyan-300 text-lg">{formatCurrency(kpiData.kpis.totalProfit)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Indicadores Clave
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Margen de utilidad</span>
                  <span className="font-semibold text-cyan-300 text-lg">{formatPercentage(kpiData.kpis.profitMargin)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Ratio de costos</span>
                  <span className={`font-semibold text-lg ${
                    kpiData.kpis.costPercentage <= 60 ? 'text-green-300' : 'text-amber-300'
                  }`}>
                    {formatPercentage(kpiData.kpis.costPercentage)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-600/50">
                  <span className="text-slate-300 font-semibold">Eficiencia</span>
                  <span className={`font-bold text-lg ${
                    kpiData.kpis.costPercentage <= 60 ? 'text-green-300' : 'text-amber-300'
                  }`}>
                    {kpiData.kpis.costPercentage <= 60 ? 'Óptima' : 'Mejorable'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Datos del Período
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Cuentas de ingresos</span>
                  <span className="font-semibold text-cyan-300 text-lg">{kpiData.metadata.accountBreakdown.income}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Cuentas de costos</span>
                  <span className="font-semibold text-lime-300 text-lg">{kpiData.metadata.accountBreakdown.costs}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Cuentas de rentabilidad</span>
                  <span className="font-semibold text-green-300 text-lg">{kpiData.metadata.accountBreakdown.profit}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-600/50">
                  <span className="text-slate-300 font-semibold">Total movimientos</span>
                  <span className="font-bold text-white text-lg">{kpiData.metadata.totalEntries.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
