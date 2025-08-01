// API para análisis DIRECTOS por Centro de Costo
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')
    const month = parseInt(searchParams.get('month') || '12')

    // Obtener datos financieros acumulados hasta el mes especificado
    const financialData = await prisma.chartOfAccountEntry.findMany({
      where: {
        year: year,
        month: {
          lte: month
        }
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

    // Definir agrupaciones específicas con códigos exactos del documento
    const agrupaciones = {
      PREMIOS: {
        ingresos: ['4.1.2.1.2.1', '4.1.2.2.1', '4.1.2.2.1'],
        costos: ['5.1.1.2.1', '5.1.1.3.2']
      },
      LOGISTICA: {
        ingresos: ['4.1.2.1.2.2', '4.1.2.2.2'],
        costos: ['5.1.1.2.2', '5.1.1.3.3']
      },
      PLATAFORMAS: {
        ingresos: ['4.1.2.1.2.3', '4.1.2.2.3'],
        costos: ['5.1.1.2.3', '5.1.1.3.4']
      },
      CELULAR: {
        ingresos: ['4.1.2.1.2.5', '4.1.2.2.5'],
        costos: ['5.1.1.2.6', '5.1.1.3.6']
      },
      ADMINISTRACION: {
        ingresos: ['4.1.2.1.2.6', '4.1.2.2.6'],
        costos: ['5.1.1.3.7']
      }
    }

    // Función para calcular datos por agrupación
    const calculateAgrupacion = (agrupacion: { ingresos: string[], costos: string[] }) => {
      let totalIngresos = 0
      let totalCostos = 0

      financialData.forEach(entry => {
        const accountCode = entry.account.code
        const value = parseFloat(entry.value.toString())

        // Verificar si la cuenta pertenece a ingresos de esta agrupación
        if (agrupacion.ingresos.some((codigo: string) => accountCode.startsWith(codigo))) {
          totalIngresos += value
        }

        // Verificar si la cuenta pertenece a costos de esta agrupación
        if (agrupacion.costos.some((codigo: string) => accountCode.startsWith(codigo))) {
          totalCostos += value
        }
      })

      const margen = totalIngresos - totalCostos
      const margenPorcentaje = totalIngresos > 0 ? (margen / totalIngresos) * 100 : 0
      const isProblematic = totalIngresos <= totalCostos

      return {
        totalIngresos,
        totalCostos,
        margen,
        margenPorcentaje,
        isProblematic
      }
    }

    // Calcular datos para cada agrupación
    const resultados = Object.keys(agrupaciones).map(key => {
      const agrupacion = agrupaciones[key as keyof typeof agrupaciones]
      const calculo = calculateAgrupacion(agrupacion)

      return {
        id: key.toLowerCase(),
        name: key,
        ...calculo,
        codigosIngresos: agrupacion.ingresos,
        codigosCostos: agrupacion.costos
      }
    })

    // Obtener centros de costo activos para la tabla detallada
    const costCenters = await prisma.costCenter.findMany({
      where: {
        active: true
      },
      include: {
        business: {
          select: {
            commercial_name: true
          }
        }
      }
    })

    // Calcular datos detallados por centro de costo
    const costCenterDetails = costCenters.map(cc => {
      const ccFinancialData = financialData.filter(entry => entry.costCenterId === cc.id)
      
      let ingresos = 0
      let costos = 0

      ccFinancialData.forEach(entry => {
        const accountCode = entry.account.code
        const value = parseFloat(entry.value.toString())

        if (accountCode.startsWith('4')) {
          ingresos += value
        } else if (accountCode.startsWith('5.1')) {
          costos += value
        }
      })

      return {
        id: cc.id,
        name: cc.name,
        code: cc.code,
        businessName: cc.business?.commercial_name || 'Sin Cliente',
        ingresos,
        costos,
        margen: ingresos - costos,
        isProblematic: ingresos <= costos
      }
    })

    const response = {
      success: true,
      data: {
        year: year,
        month: month,
        period: `${year}-${month.toString().padStart(2, '0')}`,
        agrupaciones: resultados,
        costCenters: costCenterDetails,
        summary: {
          totalAgrupaciones: resultados.length,
          agrupacionesProblematicas: resultados.filter(r => r.isProblematic).length,
          totalCostCenters: costCenterDetails.length,
          costCentersProblematicos: costCenterDetails.filter(cc => cc.isProblematic).length
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en API Directos:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    }, { status: 500 })
  }
}