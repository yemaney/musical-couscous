"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Waves,
  ShieldCheck,
  Zap,
  BarChart3,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Settings2,
  Database,
  Maximize2,
  CheckCircle2,
  Circle,
  HelpCircle,
  HardDrive,
  Cpu,
  Server,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StrategySize = "balanced" | "high" | "cost"
type DataSafety = "standard" | "high"

interface ComputeStrategyState {
  isAdvancedMode: boolean
  strategySize: StrategySize
  dataSafety: DataSafety
  baseMinMachines: number
  baseMaxMachines: number
  baseCpu: number
  baseMemory: number
  dataMinMachines: number
  dataMaxMachines: number
  dataCpu: number
  dataMemory: number
  backupFrequency: "daily" | "weekly"
  storageSize: number
  dataRetention: number
}

function HelperTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function SelectionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  recommended,
}: {
  selected: boolean
  onClick: () => void
  icon: any
  title: string
  description: string
  recommended?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group",
        selected
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/5"
          : "border-border bg-card hover:border-blue-500/30 hover:bg-blue-50/30"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wider">
          Recommended
        </span>
      )}
      <div className="flex gap-4">
        <div
          className={cn(
            "p-2.5 rounded-lg shrink-0 transition-colors",
            selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground group-hover:text-blue-600"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold text-sm", selected ? "text-blue-900" : "text-foreground")}>
            {title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/30" />
          )}
        </div>
      </div>
    </button>
  )
}

export function GCPComputeStrategyWizard() {
  const router = useRouter()
  const [state, setState] = useState<ComputeStrategyState>({
    isAdvancedMode: false,
    strategySize: "balanced",
    dataSafety: "standard",
    baseMinMachines: 1,
    baseMaxMachines: 2,
    baseCpu: 2,
    baseMemory: 8,
    dataMinMachines: 1,
    dataMaxMachines: 5,
    dataCpu: 4,
    dataMemory: 16,
    backupFrequency: "daily",
    storageSize: 100,
    dataRetention: 30,
  })

  const updateState = (updates: Partial<ComputeStrategyState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const specs = useMemo(() => {
    if (state.isAdvancedMode) {
      return {
        base: { min: state.baseMinMachines, max: state.baseMaxMachines, cpu: state.baseCpu, memory: state.baseMemory },
        data: { min: state.dataMinMachines, max: state.dataMaxMachines, cpu: state.dataCpu, memory: state.dataMemory }
      }
    }
    
    switch (state.strategySize) {
      case "high":
        return {
          base: { min: 2, max: 2, cpu: 4, memory: 16 },
          data: { min: 2, max: 10, cpu: 8, memory: 32 }
        }
      case "cost":
        return {
          base: { min: 1, max: 1, cpu: 2, memory: 4 },
          data: { min: 1, max: 3, cpu: 2, memory: 8 }
        }
      default: // balanced
        return {
          base: { min: 1, max: 2, cpu: 2, memory: 8 },
          data: { min: 1, max: 5, cpu: 4, memory: 16 }
        }
    }
  }, [state])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">GCP Compute Strategy</h1>
            </div>
            <p className="text-muted-foreground">Define how your GKE cluster and data processing should behave.</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground mr-1">Advanced Mode</span>
            <Switch checked={state.isAdvancedMode} onCheckedChange={(val) => updateState({ isAdvancedMode: val })} />
          </div>
        </div>

        <div className="space-y-10">
          {!state.isAdvancedMode ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">System Performance</h3>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectionCard
                    selected={state.strategySize === "balanced"}
                    onClick={() => updateState({ strategySize: "balanced" })}
                    recommended
                    icon={BarChart3}
                    title="Balanced"
                    description="Standard n2D instances for common workloads."
                  />
                  <SelectionCard
                    selected={state.strategySize === "high"}
                    onClick={() => updateState({ strategySize: "high" })}
                    icon={Zap}
                    title="High Performance"
                    description="Compute-optimized c2D nodes for speed."
                  />
                  <SelectionCard
                    selected={state.strategySize === "cost"}
                    onClick={() => updateState({ strategySize: "cost" })}
                    icon={DollarSign}
                    title="Cost Optimized"
                    description="e2 shared-core nodes for low overhead."
                  />
                </div>

                <Card className="bg-muted/30 border-2 border-blue-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-700 uppercase tracking-wider font-bold">
                      <BarChart3 className="w-4 h-4" /> Combined Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">1. Base System (Control & Ops)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{specs.base.min} node</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2. Data Processing (Hyperlake)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{specs.data.min} – {specs.data.max} nodes</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-center">
                        <span className="text-[10px] text-blue-700 uppercase font-bold tracking-widest mb-2 block text-center">GCP Total Capacity</span>
                        <div className="text-3xl font-black text-blue-900 text-center">
                          {specs.base.min * specs.base.cpu + specs.data.min * specs.data.cpu} → {specs.base.max * specs.base.cpu + specs.data.max * specs.data.cpu} vCPU
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="grid sm:grid-cols-2 gap-8 pt-8 border-t">
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> Data Safety</h3>
                  <div className="flex gap-2">
                    <Button variant={state.dataSafety === "standard" ? "default" : "outline"} className={cn("flex-1 rounded-xl", state.dataSafety === "standard" && "bg-blue-600")} onClick={() => updateState({ dataSafety: "standard" })}>Standard</Button>
                    <Button variant={state.dataSafety === "high" ? "default" : "outline"} className={cn("flex-1 rounded-xl", state.dataSafety === "high" && "bg-blue-600")} onClick={() => updateState({ dataSafety: "high" })}>High</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><HardDrive className="w-5 h-5 text-blue-600" /> Retention</h3>
                  <div className="flex gap-2">
                    {[7, 30, 90].map((d) => (
                      <Button key={d} variant={state.dataRetention === d ? "default" : "outline"} className={cn("flex-1 rounded-xl", state.dataRetention === d && "bg-blue-600")} onClick={() => updateState({ dataRetention: d })}>{d}d</Button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* ADVANCED MODE (Simplified for brevitiy in this step) */
            <div className="text-center py-20 border-2 border-dashed rounded-3xl">
              <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-medium italic">Advanced GCP node pool configuration is available in the dashboard after deployment.</p>
            </div>
          )}

          <div className="pt-8 border-t flex flex-col sm:flex-row justify-end items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8" size="lg" onClick={() => router.push("/gcp/review")}>
              Proceed to Final Review <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
