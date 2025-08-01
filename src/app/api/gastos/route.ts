// API para cálculos específicos de gastos con fórmulas definidas
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')
    const month = parseInt(searchParams.get('month') || '12') // Por defecto diciembre

    // Obtener datos del año actual hasta el mes especificado
    const currentYearData = await prisma.chartOfAccountEntry.findMany({
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
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    })

    // Obtener datos del año anterior hasta el mismo mes
    const previousYearData = await prisma.chartOfAccountEntry.findMany({
      where: {
        year: year - 1,
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

    // Obtener ingresos para calcular porcentajes
    const getCurrentYearIngresos = (data: typeof currentYearData) => {
      return data
        .filter(entry => entry.account.code.startsWith('4'))
        .reduce((sum, entry) => sum + parseFloat(entry.value.toString()), 0)
    }

    const getPreviousYearIngresos = (data: typeof previousYearData) => {
      return data
        .filter(entry => entry.account.code.startsWith('4'))
        .reduce((sum, entry) => sum + parseFloat(entry.value.toString()), 0)
    }

    // Función para calcular gastos por fórmula
    const calculateGastosByFormula = (data: typeof currentYearData, formula: string) => {
      const monthlyData: { [key: number]: number } = {}
      let totalValue = 0

      // Inicializar meses
      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = 0
      }

      // Procesar según la fórmula
      if (formula === 'GASTOS_PERSONAL') {
        // 5.2.1.2 + 5.1.2 - 5.2.1.2.10
        data.forEach(entry => {
          const code = entry.account.code
          const value = parseFloat(entry.value.toString())
          const month = entry.month

          if (code.startsWith('5.2.1.2') && !code.startsWith('5.2.1.2.10')) {
            monthlyData[month] += value
            totalValue += value
          } else if (code.startsWith('5.1.2')) {
            monthlyData[month] += value
            totalValue += value
          } else if (code.startsWith('5.2.1.2.10')) {
            monthlyData[month] -= value
            totalValue -= value
          }
        })
      } else if (formula === 'GASTOS_ADMINISTRATIVOS') {
        // 5.2.1.4 + 5.2.1.5 + 5.2.1.6
        data.forEach(entry => {
          const code = entry.account.code
          const value = parseFloat(entry.value.toString())
          const month = entry.month

          if (code.startsWith('5.2.1.4') || code.startsWith('5.2.1.5') || code.startsWith('5.2.1.6')) {
            monthlyData[month] += value
            totalValue += value
          }
        })
      } else if (formula === 'GASTOS_INTERES_FINANCIERO') {
        // 5.2.1.3.1
        data.forEach(entry => {
          const code = entry.account.code
          const value = parseFloat(entry.value.toString())
          const month = entry.month

          if (code.startsWith('5.2.1.3.1')) {
            monthlyData[month] += value
            totalValue += value
          }
        })
      } else if (formula === 'SEGUROS_PERSONAL') {
        // 5.2.1.2.10
        data.forEach(entry => {
          const code = entry.account.code
          const value = parseFloat(entry.value.toString())
          const month = entry.month

          if (code.startsWith('5.2.1.2.10')) {
            monthlyData[month] += value
            totalValue += value
          }
        })
      }

      return { totalValue, monthlyData }
    }

    // Calcular todos los gastos
    const currentYearIngresos = getCurrentYearIngresos(currentYearData)
    const previousYearIngresos = getPreviousYearIngresos(previousYearData)

    const gastosPersonalCurrent = calculateGastosByFormula(currentYearData, 'GASTOS_PERSONAL')
    const gastosPersonalPrevious = calculateGastosByFormula(previousYearData, 'GASTOS_PERSONAL')

    const gastosAdministrativosCurrent = calculateGastosByFormula(currentYearData, 'GASTOS_ADMINISTRATIVOS')
    const gastosAdministrativosPrevious = calculateGastosByFormula(previousYearData, 'GASTOS_ADMINISTRATIVOS')

    const gastosInteresFinancieroCurrent = calculateGastosByFormula(currentYearData, 'GASTOS_INTERES_FINANCIERO')
    const gastosInteresFinancieroPrevious = calculateGastosByFormula(previousYearData, 'GASTOS_INTERES_FINANCIERO')

    const segurosPersonalCurrent = calculateGastosByFormula(currentYearData, 'SEGUROS_PERSONAL')
    const segurosPersonalPrevious = calculateGastosByFormula(previousYearData, 'SEGUROS_PERSONAL')

    // Construir datos mensuales para gráficos
    const buildMonthlyChart = (monthlyData: { [key: number]: number }) => {
      const chartData = []
      for (let month = 1; month <= 12; month++) {
        chartData.push({
          month: month,
          monthName: new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'short' }),
          value: monthlyData[month] || 0
        })
      }
      return chartData.filter(item => item.value > 0)
    }

    const response = {
      success: true,
      data: {
        year: year,
        month: month,
        previousYear: year - 1,
        ingresos: {
          current: currentYearIngresos,
          previous: previousYearIngresos
        },
        gastos: [
          {
            id: 'gastos_personal',
            name: 'GASTOS PERSONAL',
            formula: '5.2.1.2 + 5.1.2 - 5.2.1.2.10',
            currentValue: gastosPersonalCurrent.totalValue,
            previousValue: gastosPersonalPrevious.totalValue,
            difference: gastosPersonalCurrent.totalValue - gastosPersonalPrevious.totalValue,
            percentageOfIncome: currentYearIngresos > 0 ? (gastosPersonalCurrent.totalValue / currentYearIngresos) * 100 : 0,
            monthlyChart: buildMonthlyChart(gastosPersonalCurrent.monthlyData)
          },
          {
            id: 'gastos_administrativos',
            name: 'GASTOS ADMINISTRATIVOS',
            formula: '5.2.1.4 + 5.2.1.5 + 5.2.1.6',
            currentValue: gastosAdministrativosCurrent.totalValue,
            previousValue: gastosAdministrativosPrevious.totalValue,
            difference: gastosAdministrativosCurrent.totalValue - gastosAdministrativosPrevious.totalValue,
            percentageOfIncome: currentYearIngresos > 0 ? (gastosAdministrativosCurrent.totalValue / currentYearIngresos) * 100 : 0,
            monthlyChart: buildMonthlyChart(gastosAdministrativosCurrent.monthlyData)
          },
          {
            id: 'gastos_interes_financiero',
            name: 'GASTOS INTERES FINANCIERO',
            formula: '5.2.1.3.1',
            currentValue: gastosInteresFinancieroCurrent.totalValue,
            previousValue: gastosInteresFinancieroPrevious.totalValue,
            difference: gastosInteresFinancieroCurrent.totalValue - gastosInteresFinancieroPrevious.totalValue,
            percentageOfIncome: currentYearIngresos > 0 ? (gastosInteresFinancieroCurrent.totalValue / currentYearIngresos) * 100 : 0,
            monthlyChart: buildMonthlyChart(gastosInteresFinancieroCurrent.monthlyData)
          },
          {
            id: 'seguros_personal',
            name: 'SEGUROS PERSONAL',
            formula: '5.2.1.2.10',
            currentValue: segurosPersonalCurrent.totalValue,
            previousValue: segurosPersonalPrevious.totalValue,
            difference: segurosPersonalCurrent.totalValue - segurosPersonalPrevious.totalValue,
            percentageOfIncome: currentYearIngresos > 0 ? (segurosPersonalCurrent.totalValue / currentYearIngresos) * 100 : 0,
            monthlyChart: buildMonthlyChart(segurosPersonalCurrent.monthlyData)
          }
        ]
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en API Gastos:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    }, { status: 500 })
  }
}