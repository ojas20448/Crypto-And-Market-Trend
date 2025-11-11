"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiKeyDialog() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    // Check if API key exists in localStorage
    const storedKey = localStorage.getItem("alpha_vantage_api_key")
    if (storedKey) {
      setApiKey(storedKey)
      setHasKey(true)
    } else {
      // Show dialog if no key found
      setOpen(true)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("alpha_vantage_api_key", apiKey.trim())
      setHasKey(true)
      setOpen(false)
      // Reload the page to fetch data with new API key
      window.location.reload()
    }
  }

  const handleClear = () => {
    localStorage.removeItem("alpha_vantage_api_key")
    setApiKey("")
    setHasKey(false)
  }

  return (
    <>
      {/* Settings button in header */}
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        API Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alpha Vantage API Key</DialogTitle>
            <DialogDescription>
              Enter your Alpha Vantage API key to access real-time stock data. You can get a free API key from{" "}
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                alphavantage.co
              </a>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertDescription>
                Free tier includes 25 API requests per day and 5 requests per minute. If no key is provided, the app
                will use mock data.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              {hasKey && (
                <p className="text-xs text-green-600 dark:text-green-400">API key is currently saved and active</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">How to get your free API key:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Visit alphavantage.co/support/#api-key</li>
                <li>Enter your email address</li>
                <li>Click "GET FREE API KEY"</li>
                <li>Copy the key and paste it above</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {hasKey && (
                <Button variant="destructive" onClick={handleClear}>
                  Clear Key
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!apiKey.trim()}>
                Save Key
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
