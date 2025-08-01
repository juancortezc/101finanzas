// API de prueba para verificar conexión a base de datos
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Probar conexión básica
    const businessCount = await prisma.business.count()
    const accountsCount = await prisma.chartOfAccount.count()
    const entriesCount = await prisma.chartOfAccountEntry.count()
    
    // Obtener un resumen básico
    const sampleBusiness = await prisma.business.findFirst({
      select: {
        id: true,
        commercial_name: true,
        active: true
      }
    })

    // Obtener centros de costo para identificar GENERAL
    const costCenters = await prisma.costCenter.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        active: true
      },
      take: 10
    })

    // Buscar el centro de costo GENERAL específicamente
    const generalCostCenter = await prisma.costCenter.findFirst({
      where: {
        OR: [
          { name: { contains: 'GENERAL', mode: 'insensitive' } },
          { name: { contains: 'General', mode: 'insensitive' } },
          { code: { contains: 'GENERAL', mode: 'insensitive' } },
          { code: { contains: 'General', mode: 'insensitive' } }
        ],
        active: true
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        connection: 'OK',
        tables: {
          business: businessCount,
          accounts: accountsCount,
          entries: entriesCount,
          costCenters: costCenters.length
        },
        sample: sampleBusiness,
        costCenters: costCenters,
        generalCostCenter: generalCostCenter
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 })
  }
}