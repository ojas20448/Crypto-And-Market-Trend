"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PerformanceMetrics } from "@/lib/types"

interface ConfusionMatrixProps {
  metrics: PerformanceMetrics
}

export function ConfusionMatrix({ metrics }: ConfusionMatrixProps) {
  const { confusionMatrix } = metrics

  const getIntensity = (value: number, max: number) => {
    const intensity = max > 0 ? value / max : 0
    return Math.round(intensity * 100)
  }

  const allValues = [
    ...Object.values(confusionMatrix.buy),
    ...Object.values(confusionMatrix.hold),
    ...Object.values(confusionMatrix.sell),
  ]
  const maxValue = Math.max(...allValues, 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confusion Matrix</CardTitle>
        <CardDescription>Predicted vs Actual outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-sm font-medium">
            <div></div>
            <div className="text-center text-muted-foreground">Buy</div>
            <div className="text-center text-muted-foreground">Hold</div>
            <div className="text-center text-muted-foreground">Sell</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center text-sm font-medium">Buy</div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold transition-colors"
              style={{
                backgroundColor: `hsl(var(--success) / ${getIntensity(confusionMatrix.buy.buy, maxValue)}%)`,
              }}
            >
              {confusionMatrix.buy.buy}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--muted-foreground) / ${getIntensity(confusionMatrix.buy.hold, maxValue)}%)`,
              }}
            >
              {confusionMatrix.buy.hold}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--destructive) / ${getIntensity(confusionMatrix.buy.sell, maxValue)}%)`,
              }}
            >
              {confusionMatrix.buy.sell}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center text-sm font-medium">Hold</div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--success) / ${getIntensity(confusionMatrix.hold.buy, maxValue)}%)`,
              }}
            >
              {confusionMatrix.hold.buy}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--muted-foreground) / ${getIntensity(confusionMatrix.hold.hold, maxValue)}%)`,
              }}
            >
              {confusionMatrix.hold.hold}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--destructive) / ${getIntensity(confusionMatrix.hold.sell, maxValue)}%)`,
              }}
            >
              {confusionMatrix.hold.sell}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center text-sm font-medium">Sell</div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--success) / ${getIntensity(confusionMatrix.sell.buy, maxValue)}%)`,
              }}
            >
              {confusionMatrix.sell.buy}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--muted-foreground) / ${getIntensity(confusionMatrix.sell.hold, maxValue)}%)`,
              }}
            >
              {confusionMatrix.sell.hold}
            </div>
            <div
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: `hsl(var(--destructive) / ${getIntensity(confusionMatrix.sell.sell, maxValue)}%)`,
              }}
            >
              {confusionMatrix.sell.sell}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Rows: Predicted</span>
            <span>Columns: Actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
