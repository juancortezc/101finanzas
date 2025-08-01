'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'

// Tipos para los datos de directos
interface AgrupacionData {
  id: string
  name: string
  totalIngresos: number
  totalCostos: number
  margen: number
  margenPorcentaje: number
  isProblematic: boolean
  codigosIngresos: string[]
  codigosCostos: string[]
}

interface CostCenterData {
  id: string
  name: string
  code: string
  businessName: string
  ingresos: number
  costos: number
  margen: number
  isProblematic: boolean
}

interface DirectosApiResponse {
  success: boolean
  data: {
    year: number
    month: number
    period: string
    agrupaciones: AgrupacionData[]
    costCenters: CostCenterData[]
    summary: {
      totalAgrupaciones: number
      agrupacionesProblematicas: number
      totalCostCenters: number
      costCentersProblematicos: number
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

// Colores para las agrupaciones
const AGRUPACION_COLORS = {
  PREMIOS: '#FFE066',      // Amarillo
  LOGISTICA: '#8CD4D4',    // Cyan
  PLATAFORMAS: '#5DADE2',  // Azul
  CELULAR: '#D5DBDB',      // Gris
  ADMINISTRACION: '#F8BBD9' // Rosa
}

export default function DirectosPage() {
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionData[]>([])
  const [costCenters, setCostCenters] = useState<CostCenterData[]>([])
  const [summary, setSummary] = useState<{
    totalAgrupaciones: number
    agrupacionesProblematicas: number
    totalCostCenters: number
    costCentersProblematicos: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedMonth, setSelectedMonth] = useState(12)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/directos?year=${selectedYear}&month=${selectedMonth}`)
        const result: DirectosApiResponse = await response.json()
        
        if (result.success) {
          setAgrupaciones(result.data.agrupaciones)
          setCostCenters(result.data.costCenters)
          setSummary(result.data.summary)
        } else {
          setError('Error al cargar los datos directos')
        }
      } catch (err) {
        setError('Error de conexión')
        console.error('Error fetching directos data:', err)
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
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-600 rounded-full animate-spin mx-auto" style={{animationDelay: '0.15s', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Cargando análisis directos...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
                  DIRECTOS Centro de Costo
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1 tracking-widest uppercase">
                  Validación Ingresos vs Costos por Agrupación
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-3">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg transition-all duration-200 hover:shadow-xl"
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
                  {selectedYear}-{selectedMonth.toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Acumulado a la fecha
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Cards de Agrupaciones - Estilo como el documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {agrupaciones.map((agrupacion) => {
            const backgroundColor = AGRUPACION_COLORS[agrupacion.name as keyof typeof AGRUPACION_COLORS] || '#f3f4f6'
            
            return (
              <div 
                key={agrupacion.id}
                className={`backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  agrupacion.isProblematic ? 'ring-2 ring-red-500' : ''
                }`}
                style={{ backgroundColor: backgroundColor }}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {agrupacion.name}
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(agrupacion.totalIngresos)}
                    </p>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">
                      Ingresos
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatCurrency(agrupacion.totalCostos)}
                      </p>
                      <p className="text-xs text-gray-600">Costos</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${
                        agrupacion.isProblematic ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {formatCurrency(agrupacion.margen)}
                      </p>  
                      <p className="text-xs text-gray-600">Margen</p>
                    </div>
                  </div>

                  {agrupacion.isProblematic && (
                    <div className="mt-3 text-red-700 font-bold text-sm flex items-center justify-center gap-2">
                      ⚠️ ALERTA: Ingresos ≤ Costos
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabla Detallada de Centros de Costo */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Detalle por Centro de Costo
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Centro de Costo</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Cliente</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Ingresos</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Costos</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Margen</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {costCenters.map((cc) => (
                  <tr key={cc.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${cc.isProblematic ? 'bg-red-50/50' : ''}`}>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{cc.name}</p>
                        <p className="text-xs text-gray-500">{cc.code}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{cc.businessName}</td>
                    <td className="py-4 px-4 text-right text-gray-900">{formatCurrency(cc.ingresos)}</td>
                    <td className="py-4 px-4 text-right text-gray-900">{formatCurrency(cc.costos)}</td>
                    <td className={`py-4 px-4 text-right font-semibold ${cc.margen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cc.margen)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {cc.isProblematic ? (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                          🚨 ALERTA
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                          ✅ OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de Alertas */}
        {summary && (summary.agrupacionesProblematicas > 0 || summary.costCentersProblematicos > 0) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Alertas Detectadas</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {summary.agrupacionesProblematicas > 0 && (
                      <li>{summary.agrupacionesProblematicas} agrupaciones con ingresos ≤ costos</li>
                    )}
                    {summary.costCentersProblematicos > 0 && (
                      <li>{summary.costCentersProblematicos} centros de costo con ingresos ≤ costos</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}