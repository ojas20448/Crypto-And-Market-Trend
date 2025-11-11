"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Trade } from "@/lib/backtesting"
import { TrendingUpIcon, TrendingDownIcon } from "@/lib/icons"
import { format } from "@/lib/date-utils"

interface TradeLogProps {
  trades: Trade[]
}

export function TradeLog({ trades }: TradeLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Log</CardTitle>
        <CardDescription>Detailed history of all executed trades</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No trades executed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="rounded-lg border border-border p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {trade.type === "long" ? (
                        <TrendingUpIcon className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-destructive" />
                      )}
                      <Badge variant={trade.type === "long" ? "default" : "destructive"}>
                        {trade.type.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={(trade.pnl || 0) > 0 ? "default" : "destructive"}
                        className={(trade.pnl || 0) > 0 ? "bg-success text-success-foreground" : ""}
                      >
                        {(trade.pnl || 0) > 0 ? "+" : ""}₹{(trade.pnl || 0).toFixed(2)}
                      </Badge>
                    </div>
                    <span
                      className={`text-sm font-mono font-semibold ${
                        (trade.pnlPercent || 0) > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {(trade.pnlPercent || 0) > 0 ? "+" : ""}
                      {(trade.pnlPercent || 0).toFixed(2)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Entry:</span>
                      <span className="font-mono ml-1">₹{trade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exit:</span>
                      <span className="font-mono ml-1">
                        {trade.exitPrice ? `₹${trade.exitPrice.toFixed(2)}` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shares:</span>
                      <span className="font-mono ml-1">{trade.shares.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-mono ml-1">
                        {trade.exitTime
                          ? `${Math.round((new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime()) / 60000)}m`
                          : "Open"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">{trade.reason}</p>

                  <div className="text-xs text-muted-foreground">
                    {format(new Date(trade.entryTime), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
