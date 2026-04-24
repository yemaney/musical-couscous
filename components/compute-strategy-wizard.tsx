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
type DataVolume = "small" | "medium" | "large"

interface ComputeStrategyState {
  isAdvancedMode: boolean
  // Simple Mode
  strategySize: StrategySize
  dataSafety: DataSafety
  dataVolume: DataVolume
  isStorageAdvancedExpanded: boolean
  // Advanced Mode - Base System
  baseMinMachines: number
  baseMaxMachines: number
  baseCpu: number
  baseMemory: number
  // Advanced Mode - Data Processing (Hyperlake)
  dataMinMachines: number
  dataMaxMachines: number
  dataCpu: number
  dataMemory: number
  // Data Settings
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
          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/5"
          : "border-border bg-card hover:border-emerald-500/30 hover:bg-emerald-50/30"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wider">
          Recommended
        </span>
      )}
      <div className="flex gap-4">
        <div
          className={cn(
            "p-2.5 rounded-lg shrink-0 transition-colors",
            selected ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground group-hover:text-emerald-600"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold text-sm", selected ? "text-emerald-900" : "text-foreground")}>
            {title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/30" />
          )}
        </div>
      </div>
    </button>
  )
}

export function ComputeStrategyWizard() {
  const router = useRouter()
  const [state, setState] = useState<ComputeStrategyState>({
    isAdvancedMode: false,
    strategySize: "balanced",
    dataSafety: "standard",
    dataVolume: "medium",
    isStorageAdvancedExpanded: false,
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Compute Strategy</h1>
            </div>
            <p className="text-muted-foreground">
              Define how your system capacity and data processing should behave.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground mr-1">Advanced Mode</span>
            <Switch 
              checked={state.isAdvancedMode} 
              onCheckedChange={(val) => updateState({ isAdvancedMode: val })} 
            />
          </div>
        </div>

        {/* Reassurance */}
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            We&apos;ve combined system and data processing into one simple strategy.
          </p>
        </div>

        <div className="space-y-10">
          {!state.isAdvancedMode ? (
            /* SIMPLE MODE */
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Overall Strategy */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg">System Performance</h3>
                  <HelperTooltip text="Choose the overall power level for your system and data processing." />
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectionCard
                    selected={state.strategySize === "balanced"}
                    onClick={() => updateState({ strategySize: "balanced" })}
                    recommended
                    icon={BarChart3}
                    title="Balanced"
                    description="Optimized for consistent performance."
                  />
                  <SelectionCard
                    selected={state.strategySize === "high"}
                    onClick={() => updateState({ strategySize: "high" })}
                    icon={Zap}
                    title="High Power"
                    description="Maximum speed for heavy workloads."
                  />
                  <SelectionCard
                    selected={state.strategySize === "cost"}
                    onClick={() => updateState({ strategySize: "cost" })}
                    icon={DollarSign}
                    title="Cost Saving"
                    description="Minimal spend for smaller projects."
                  />
                </div>

                {/* Combined Summary Card */}
                <Card className="bg-muted/30 border-2 border-emerald-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-700 uppercase tracking-wider font-bold">
                      <BarChart3 className="w-4 h-4" />
                      Combined Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">1. Base System (Always running)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{specs.base.min} machine</span>
                            <span className="text-xs text-muted-foreground">Runs core services</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2. Data Processing (Hyperlake)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{specs.data.min} – {specs.data.max} machines</span>
                            <span className="text-xs text-muted-foreground">Scales with workload</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-center">
                        <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-widest mb-2 block text-center">Total Capacity Range</span>
                        <div className="text-3xl font-black text-emerald-900 text-center">
                          {specs.base.min * specs.base.cpu + specs.data.min * specs.data.cpu} → {specs.base.max * specs.base.cpu + specs.data.max * specs.data.cpu} CPU
                        </div>
                        <div className="h-1.5 w-full bg-emerald-200/50 rounded-full mt-3 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 pt-4 border-t border-dashed">
                      <Info className="w-3.5 h-3.5 text-emerald-500" />
                      Your system automatically adds machines for data processing when needed and removes them when idle.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Data Safety & Storage (Unified) */}
              <section className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold">Data Safety</h3>
                    </div>
                    <div className="flex gap-2">
                       <Button
                        variant={state.dataSafety === "standard" ? "default" : "outline"}
                        className={cn("flex-1 h-12 rounded-xl", state.dataSafety === "standard" && "bg-emerald-600")}
                        onClick={() => updateState({ dataSafety: "standard" })}
                      >
                        Standard
                      </Button>
                      <Button
                        variant={state.dataSafety === "high" ? "default" : "outline"}
                        className={cn("flex-1 h-12 rounded-xl", state.dataSafety === "high" && "bg-emerald-600")}
                        onClick={() => updateState({ dataSafety: "high" })}
                      >
                        High Protection
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold">Data Retention</h3>
                    </div>
                    <div className="flex gap-2">
                      {[7, 30, 90].map((d) => (
                        <Button
                          key={d}
                          variant={state.dataRetention === d ? "default" : "outline"}
                          className={cn("flex-1 h-12 rounded-xl", state.dataRetention === d && "bg-emerald-600")}
                          onClick={() => updateState({ dataRetention: d })}
                        >
                          {d} Days
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* ADVANCED MODE */
            <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Base System Machines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Base System Machines
                  </CardTitle>
                  <CardDescription>
                    These machines run core system services and are always running.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Min machines</Label>
                        <span className="font-bold text-blue-600">{state.baseMinMachines}</span>
                      </div>
                      <Slider
                        value={[state.baseMinMachines]}
                        min={1}
                        max={3}
                        step={1}
                        onValueChange={([val]) => updateState({ baseMinMachines: val })}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Max machines</Label>
                        <span className="font-bold text-blue-600">{state.baseMaxMachines}</span>
                      </div>
                      <Slider
                        value={[state.baseMaxMachines]}
                        min={state.baseMinMachines}
                        max={5}
                        step={1}
                        onValueChange={([val]) => updateState({ baseMaxMachines: val })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>CPU per machine</Label>
                      <Input 
                        type="number" 
                        value={state.baseCpu} 
                        onChange={(e) => updateState({ baseCpu: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory (GB)</Label>
                      <Input 
                        type="number" 
                        value={state.baseMemory} 
                        onChange={(e) => updateState({ baseMemory: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Processing Machines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    Data Processing (Hyperlake)
                  </CardTitle>
                  <CardDescription>
                    These machines handle queries and processing. They scale separately based on demand.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Min machines</Label>
                        <span className="font-bold text-emerald-600">{state.dataMinMachines}</span>
                      </div>
                      <Slider
                        value={[state.dataMinMachines]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={([val]) => updateState({ dataMinMachines: val })}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Max machines</Label>
                        <span className="font-bold text-emerald-600">{state.dataMaxMachines}</span>
                      </div>
                      <Slider
                        value={[state.dataMaxMachines]}
                        min={state.dataMinMachines}
                        max={20}
                        step={1}
                        onValueChange={([val]) => updateState({ dataMaxMachines: val })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>CPU per machine</Label>
                      <Input 
                        type="number" 
                        value={state.dataCpu} 
                        onChange={(e) => updateState({ dataCpu: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory (GB)</Label>
                      <Input 
                        type="number" 
                        value={state.dataMemory} 
                        onChange={(e) => updateState({ dataMemory: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Storage Advanced (Partial) */}
              <Card>
                 <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <HardDrive className="w-5 h-5 text-emerald-600" />
                       Advanced Data Settings
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label>Backup Frequency</Label>
                          <div className="flex gap-2">
                             <Button
                                variant={state.backupFrequency === "daily" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => updateState({ backupFrequency: "daily" })}
                             >Daily</Button>
                             <Button
                                variant={state.backupFrequency === "weekly" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => updateState({ backupFrequency: "weekly" })}
                             >Weekly</Button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label>Storage Allocation (GB)</Label>
                          <Input 
                            type="number" 
                            value={state.storageSize} 
                            onChange={(e) => updateState({ storageSize: parseInt(e.target.value) })}
                          />
                       </div>
                    </div>
                 </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="pt-8 border-t flex flex-col sm:flex-row justify-end items-center gap-3">
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto text-muted-foreground"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 gap-2 px-8" 
              size="lg"
              onClick={() => router.push("/review")}
            >
              Proceed to Final Review
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
