// API de diagnóstico para revisar estructura de cuentas
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener todas las cuentas únicas y sus códigos
    const allAccounts = await prisma.account.findMany({
      select: {
        code: true,
        name: true
      },
      orderBy: {
        code: 'asc'
      }
    })

    // Obtener datos de enero 2025 con códigos de cuenta
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
      },
      orderBy: {
        account: {
          code: 'asc'
        }
      }
    })

    // Agrupar por código de cuenta y sumar valores
    const accountSummary: { [key: string]: { name: string, total: number, count: number } } = {}
    
    enero2025Data.forEach(entry => {
      const code = entry.account.code
      const value = parseFloat(entry.value.toString())
      
      if (!accountSummary[code]) {
        accountSummary[code] = {
          name: entry.account.name,
          total: 0,
          count: 0
        }
      }
      
      accountSummary[code].total += value
      accountSummary[code].count += 1
    })

    return NextResponse.json({
      success: true,
      data: {
        totalAccounts: allAccounts.length,
        enero2025Entries: enero2025Data.length,
        allAccounts: allAccounts,
        enero2025Summary: Object.entries(accountSummary).map(([code, data]) => ({
          code,
          name: data.name,
          total: data.total,
          count: data.count
        })),
        rawEnero2025Data: enero2025Data.slice(0, 20) // Primeros 20 registros como ejemplo
      }
    })

  } catch (error) {
    console.error('Error en debug-accounts API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })
  }
}