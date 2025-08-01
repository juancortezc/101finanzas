// API para tendencias mensuales - nueva implementación
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')
    
    // Crear datos mensuales consultando cada mes específicamente
    const chartData = []
    
    // Consultar cada mes por separado
    for (let month = 1; month <= 12; month++) {
      // Obtener todas las entradas del mes
      const monthData = await prisma.chartOfAccountEntry.findMany({
        where: {
          year: year,
          month: month
        },
        include: {
          account: {
            select: {
              code: true,
              name: true
            }
          }
        }
      })

      // Agregar valores por tipo de cuenta
      let ingresos = 0
      let costos = 0  
      let rentabilidad = 0

      monthData.forEach(entry => {
        const accountCode = entry.account.code
        const value = parseFloat(entry.value.toString())

        // Clasificar por código de cuenta:
        // 4* = Ingresos, 5.1* = Costos, 6* = Rentabilidad
        if (accountCode.startsWith('4')) {
          ingresos += value
        } else if (accountCode.startsWith('5.1')) {
          costos += value
        } else if (accountCode.startsWith('6')) {
          rentabilidad += value
        }
      })
      
      // Solo incluir si hay al menos un valor
      if (ingresos > 0 || costos > 0 || rentabilidad > 0) {
        // Calcular porcentaje de costo directo (5.1/4)
        const costoDirectoPercentage = ingresos > 0 ? (costos / ingresos) * 100 : 0
        
        chartData.push({
          month: month,
          monthName: new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'short' }),
          period: `${year}-${month.toString().padStart(2, '0')}`,
          ingresos: ingresos,
          costos: costos,
          rentabilidad: rentabilidad,
          costoDirectoPercentage: costoDirectoPercentage,
          hasData: true
        })
      }
    }

    const response = {
      success: true,
      data: {
        year: year,
        trends: chartData,
        summary: {
          totalMonths: chartData.length,
          avgIncome: chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.ingresos, 0) / chartData.length : 0,
          avgCosts: chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.costos, 0) / chartData.length : 0,
          avgProfit: chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.rentabilidad, 0) / chartData.length : 0
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en API Trends:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    }, { status: 500 })
  }
}