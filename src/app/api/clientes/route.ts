// API para análisis financiero por clientes (business + cost centers)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')
    const month = parseInt(searchParams.get('month') || '12')

    // Obtener datos financieros hasta el mes especificado
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

    // Obtener información de cost centers y business
    const costCenters = await prisma.costCenter.findMany({
      where: {
        active: true,
        businessId: {
          not: null
        }
      },
      include: {
        business: {
          select: {
            id: true,
            commercial_name: true,
            legal_name: true,
            active: true
          }
        }
      }
    })

    // Obtener todos los business disponibles para mapeo
    const allBusinesses = await prisma.business.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        commercial_name: true,
        legal_name: true
      }
    })

    // Crear mapa de costCenterId -> business (incluye solución temporal)
    const costCenterToBusinessMap = new Map()
    
    // Mapear cost centers existentes
    costCenters.forEach(cc => {
      if (cc.business) {
        costCenterToBusinessMap.set(cc.id, {
          businessId: cc.business.id,
          businessName: cc.business.commercial_name,
          costCenterName: cc.name,
          costCenterCode: cc.code
        })
      }
    })

    // Obtener cost center IDs únicos de los datos financieros
    const uniqueCostCenterIds = await prisma.chartOfAccountEntry.findMany({
      where: {
        year: year,
        month: { lte: month }
      },
      select: {
        costCenterId: true
      },
      distinct: ['costCenterId']
    })

    // SOLUCIÓN TEMPORAL: Mapear cost centers huérfanos a un business genérico
    const orphanedCostCenterIds = uniqueCostCenterIds
      .map(entry => entry.costCenterId)
      .filter(id => !costCenterToBusinessMap.has(id))

    // Asignar cost centers huérfanos al primer business disponible o crear uno genérico
    let defaultBusiness = allBusinesses[0]
    if (!defaultBusiness) {
      defaultBusiness = {
        id: 'default',
        commercial_name: 'CLIENTE GENÉRICO',
        legal_name: 'Cliente Genérico'
      }
    }

    orphanedCostCenterIds.forEach((costCenterId, index) => {
      // Crear nombres descriptivos para cost centers huérfanos
      const businessName = allBusinesses[index % allBusinesses.length]?.commercial_name || defaultBusiness.commercial_name
      const businessId = allBusinesses[index % allBusinesses.length]?.id || defaultBusiness.id
      
      costCenterToBusinessMap.set(costCenterId, {
        businessId: businessId,
        businessName: businessName,
        costCenterName: `Centro ${costCenterId.substring(0, 8)}`,
        costCenterCode: `CC-${costCenterId.substring(0, 6)}`
      })
    })

    // Agrupar datos financieros por cliente (business)
    const clientsData = new Map()

    financialData.forEach(entry => {
      const costCenterInfo = costCenterToBusinessMap.get(entry.costCenterId)
      if (!costCenterInfo) return

      const businessId = costCenterInfo.businessId
      const businessName = costCenterInfo.businessName
      const accountCode = entry.account.code
      const value = parseFloat(entry.value.toString())

      // Inicializar cliente si no existe
      if (!clientsData.has(businessId)) {
        clientsData.set(businessId, {
          businessId: businessId,
          businessName: businessName,
          ingresos: 0,
          costos: 0,
          rentabilidad: 0,
          costCenters: new Set(),
          monthlyData: {}
        })
      }

      const clientData = clientsData.get(businessId)

      // Agregar cost center a la lista
      clientData.costCenters.add(costCenterInfo.costCenterName)

      // Categorizar por código de cuenta
      if (accountCode.startsWith('4')) {
        clientData.ingresos += value
      } else if (accountCode.startsWith('5.1')) {
        clientData.costos += value
      } else if (accountCode.startsWith('6')) {
        clientData.rentabilidad += value
      }

      // Datos mensuales para gráficos
      const monthKey = entry.month
      if (!clientData.monthlyData[monthKey]) {
        clientData.monthlyData[monthKey] = { ingresos: 0, costos: 0, rentabilidad: 0 }
      }

      if (accountCode.startsWith('4')) {
        clientData.monthlyData[monthKey].ingresos += value
      } else if (accountCode.startsWith('5.1')) {
        clientData.monthlyData[monthKey].costos += value
      } else if (accountCode.startsWith('6')) {
        clientData.monthlyData[monthKey].rentabilidad += value
      }
    })

    // Convertir a array y calcular métricas adicionales
    const clientsArray = Array.from(clientsData.values()).map(client => {
      // Calcular métricas
      const contribucionMarginal = client.ingresos - client.costos
      const margenContribucion = client.ingresos > 0 ? (contribucionMarginal / client.ingresos) * 100 : 0
      const costPercentage = client.ingresos > 0 ? (client.costos / client.ingresos) * 100 : 0

      // Convertir datos mensuales para gráficos
      const monthlyChart = []
      for (let m = 1; m <= month; m++) {
        const monthData = client.monthlyData[m] || { ingresos: 0, costos: 0, rentabilidad: 0 }
        if (monthData.ingresos > 0 || monthData.costos > 0 || monthData.rentabilidad > 0) {
          monthlyChart.push({
            month: m,
            monthName: new Date(year, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' }),
            ingresos: monthData.ingresos,
            costos: monthData.costos,
            rentabilidad: monthData.rentabilidad,
            contribucionMarginal: monthData.ingresos - monthData.costos,
            costPercentage: monthData.ingresos > 0 ? (monthData.costos / monthData.ingresos) * 100 : 0
          })
        }
      }

      return {
        businessId: client.businessId,
        businessName: client.businessName,
        ingresos: client.ingresos,
        costos: client.costos,
        rentabilidad: client.rentabilidad,
        contribucionMarginal: contribucionMarginal,
        margenContribucion: margenContribucion,
        costPercentage: costPercentage,
        costCentersCount: client.costCenters.size,
        costCenters: Array.from(client.costCenters),
        monthlyChart: monthlyChart
      }
    })

    // Ordenar por ingresos descendente
    clientsArray.sort((a, b) => b.ingresos - a.ingresos)

    // Calcular totales para porcentajes
    const totalIngresos = clientsArray.reduce((sum, client) => sum + client.ingresos, 0)
    const totalCostos = clientsArray.reduce((sum, client) => sum + client.costos, 0)
    const totalRentabilidad = clientsArray.reduce((sum, client) => sum + client.rentabilidad, 0)

    // Agregar porcentajes del total
    const clientsWithPercentages = clientsArray.map(client => ({
      ...client,
      percentageOfTotalIngresos: totalIngresos > 0 ? (client.ingresos / totalIngresos) * 100 : 0,
      percentageOfTotalCostos: totalCostos > 0 ? (client.costos / totalCostos) * 100 : 0,
      percentageOfTotalRentabilidad: totalRentabilidad > 0 ? (client.rentabilidad / totalRentabilidad) * 100 : 0
    }))

    const response = {
      success: true,
      data: {
        year: year,
        month: month,
        period: `${year}-${month.toString().padStart(2, '0')}`,
        totalClients: clientsWithPercentages.length,
        summary: {
          totalIngresos: totalIngresos,
          totalCostos: totalCostos,
          totalRentabilidad: totalRentabilidad,
          totalContribucionMarginal: totalIngresos - totalCostos,
          averageCostPercentage: clientsArray.length > 0 ? 
            clientsArray.reduce((sum, client) => sum + client.costPercentage, 0) / clientsArray.length : 0
        },
        clients: clientsWithPercentages
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en API Clientes:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    }, { status: 500 })
  }
}