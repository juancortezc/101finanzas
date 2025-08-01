// API de diagnóstico para revisar datos de enero 2025
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener todos los datos de enero 2025
    const enero2025Data = await prisma.chartOfAccountEntry.findMany({
      where: {
        year: 2025,
        month: 1
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

    // Separar por tipo de cuenta
    const ingresos = enero2025Data.filter(entry => entry.account.code.startsWith('4'))
    const costos = enero2025Data.filter(entry => entry.account.code.startsWith('5.1'))
    const rentabilidad = enero2025Data.filter(entry => entry.account.code.startsWith('6'))

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, entry) => sum + parseFloat(entry.value.toString()), 0)
    const totalCostos = costos.reduce((sum, entry) => sum + parseFloat(entry.value.toString()), 0)
    const totalRentabilidad = rentabilidad.reduce((sum, entry) => sum + parseFloat(entry.value.toString()), 0)

    return NextResponse.json({
      success: true,
      data: {
        periodo: "Enero 2025",
        totales: {
          ingresos: totalIngresos,
          costos: totalCostos,
          rentabilidad: totalRentabilidad
        },
        detalles: {
          ingresos: {
            count: ingresos.length,
            accounts: ingresos.map(entry => ({
              code: entry.account.code,
              name: entry.account.name,
              value: parseFloat(entry.value.toString())
            }))
          },
          costos: {
            count: costos.length,
            accounts: costos.map(entry => ({
              code: entry.account.code,
              name: entry.account.name,
              value: parseFloat(entry.value.toString())
            }))
          },
          rentabilidad: {
            count: rentabilidad.length,
            accounts: rentabilidad.map(entry => ({
              code: entry.account.code,
              name: entry.account.name,
              value: parseFloat(entry.value.toString())
            }))
          }
        },
        totalRegistros: enero2025Data.length
      }
    })

  } catch (error) {
    console.error('Error en debug API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })
  }
}