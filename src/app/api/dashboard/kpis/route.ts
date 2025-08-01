// API para KPIs principales del dashboard - nueva implementación
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')
    const month = parseInt(searchParams.get('month') || '6')

    // Función para obtener valores exactos por códigos específicos
    const getExactValues = async (targetYear: number, targetMonth: number) => {
      const [ingresosData, costosData, rentabilidadData] = await Promise.all([
        // Ingresos - código exacto '4'
        prisma.chartOfAccountEntry.findFirst({
          where: {
            year: targetYear,
            month: targetMonth,
            account: {
              code: '4'
            }
          }
        }),
        // Costos - código exacto '5.1'
        prisma.chartOfAccountEntry.findFirst({
          where: {
            year: targetYear,
            month: targetMonth,
            account: {
              code: '5.1'
            }
          }
        }),
        // Rentabilidad - código exacto '6'
        prisma.chartOfAccountEntry.findFirst({
          where: {
            year: targetYear,
            month: targetMonth,
            account: {
              code: '6'
            }
          }
        })
      ])

      return {
        ingresos: ingresosData ? parseFloat(ingresosData.value.toString()) : 0,
        costos: costosData ? parseFloat(costosData.value.toString()) : 0,
        rentabilidad: rentabilidadData ? parseFloat(rentabilidadData.value.toString()) : 0
      }
    }

    // Obtener datos del período actual
    const currentData = await getExactValues(year, month)

    // Obtener datos del período anterior (mes anterior)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const previousData = await getExactValues(prevYear, prevMonth)

    // Obtener datos del año anterior
    const yearAgoData = await getExactValues(year - 1, month)

    // Calcular porcentajes
    const costPercentage = currentData.ingresos !== 0 ? 
      (currentData.costos / currentData.ingresos) * 100 : 0
    
    const profitMargin = currentData.ingresos !== 0 ? 
      (currentData.rentabilidad / currentData.ingresos) * 100 : 0

    // Calcular variaciones
    const calculateVariation = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / Math.abs(previous)) * 100
    }

    // Obtener metadatos del período actual
    const currentPeriodData = await prisma.chartOfAccountEntry.findMany({
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

    const response = {
      success: true,
      data: {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        year,
        month,
        kpis: {
          // Valores actuales
          totalIncome: currentData.ingresos,
          totalCosts: currentData.costos,
          totalProfit: currentData.rentabilidad,
          costPercentage: costPercentage,
          profitMargin: profitMargin,
          
          // Comparaciones año anterior con valores absolutos
          yearAgoIncome: yearAgoData.ingresos,
          yearAgoCosts: yearAgoData.costos,
          yearAgoProfit: yearAgoData.rentabilidad,
          
          // Variaciones año anterior
          incomeVariationYear: calculateVariation(currentData.ingresos, yearAgoData.ingresos),
          profitVariationYear: calculateVariation(currentData.rentabilidad, yearAgoData.rentabilidad),
          costsVariationYear: calculateVariation(currentData.costos, yearAgoData.costos),
          
          // Comparaciones período anterior (mes anterior)
          previousIncome: previousData.ingresos,
          previousCosts: previousData.costos,
          previousProfit: previousData.rentabilidad,
          incomeVariationMonth: calculateVariation(currentData.ingresos, previousData.ingresos),
          profitVariationMonth: calculateVariation(currentData.rentabilidad, previousData.rentabilidad),
          costsVariationMonth: calculateVariation(currentData.costos, previousData.costos)
        },
        metadata: {
          totalEntries: currentPeriodData.length,
          uniqueAccounts: new Set(currentPeriodData.map(e => e.account.code)).size,
          accountBreakdown: {
            income: currentPeriodData.filter(e => e.account.code === '4').length,
            costs: currentPeriodData.filter(e => e.account.code === '5.1').length,
            profit: currentPeriodData.filter(e => e.account.code === '6').length
          }
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en API KPIs:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    }, { status: 500 })
  }
}