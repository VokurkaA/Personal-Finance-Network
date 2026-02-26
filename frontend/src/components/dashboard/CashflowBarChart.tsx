import { memo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useResolvedChartTheme } from '../../config/nivoTheme'

interface CashflowBarChartProps {
  month: string
  totalIncome: number
  totalExpenses: number
}

export const CashflowBarChart = memo(function CashflowBarChart({
  month,
  totalIncome,
  totalExpenses,
}: CashflowBarChartProps) {
  const { theme: nivoTheme, success, danger } = useResolvedChartTheme()

  const barData = [{ month, Income: totalIncome, Expenses: totalExpenses }]

  return (
    <div className="h-52">
      <ResponsiveBar
        data={barData}
        keys={['Income', 'Expenses']}
        indexBy="month"
        theme={nivoTheme}
        colors={[success, danger]}
        groupMode="grouped"
        padding={0.5}
        borderRadius={4}
        axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
        axisBottom={null}
        labelSkipHeight={20}
        enableGridX={false}
        margin={{ top: 10, right: 10, bottom: 10, left: 52 }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-right',
            direction: 'row',
            translateY: -16,
            translateX: 0,
            itemWidth: 80,
            itemHeight: 20,
            symbolSize: 10,
            symbolShape: 'circle',
          },
        ]}
      />
    </div>
  )
})
