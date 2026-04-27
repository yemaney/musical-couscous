"use client"

import { useState, useMemo, useEffect } from "react"
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
  PlusSquare,
  LayoutGrid
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
  // Iceberg Settings
  isIcebergEnabled: boolean
  isIcebergBackupEnabled: boolean
  icebergStorageSize: number
  icebergRetention: number
  icebergBackupSchedule: string
  // Addons & Spot
  isAddonEnabled: boolean
  addonCpu: number
  addonMemory: number
  useSpot: boolean
  baseInstanceType: string
  workerInstanceType: string
  isBackupEnabled: boolean
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
    baseMaxMachines: 1,
    baseCpu: 2,
    baseMemory: 8,
    dataMinMachines: 2,
    dataMaxMachines: 3,
    dataCpu: 4,
    dataMemory: 16,
    backupFrequency: "daily",
    storageSize: 100,
    dataRetention: 30,
    isIcebergEnabled: false,
    isIcebergBackupEnabled: false,
    icebergStorageSize: 100,
    icebergRetention: 30,
    icebergBackupSchedule: "daily",
    isAddonEnabled: true,
    addonCpu: 2,
    addonMemory: 8,
    useSpot: true,
    baseInstanceType: "t3.large",
    workerInstanceType: "t3.large",
    isBackupEnabled: true,
  })

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("computeStrategyState")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migration: If user has old default min/max machines, reset to new standards
        if (parsed.strategySize === "balanced" && (parsed.dataMinMachines === 1 || parsed.baseMaxMachines === 2)) {
          setState({ ...parsed, baseMinMachines: 1, baseMaxMachines: 1, dataMinMachines: 2, dataMaxMachines: 3, isAddonEnabled: true, addonCpu: 2, isBackupEnabled: true })
        } else {
          setState(parsed)
        }
      } catch (e) {
        console.error("Failed to parse saved state", e)
      }
    }
    setIsLoaded(true)
  }, [])

  const updateState = (updates: Partial<ComputeStrategyState>) => {
    setState((prev) => {
      let next = { ...prev, ...updates }
      
      // If strategySize changed, sync advanced fields to provide a good starting point for Advanced Mode
      if (updates.strategySize) {
        let presetSpecs;
        switch (updates.strategySize) {
          case "high":
            presetSpecs = { 
              baseInstanceType: "t3.xlarge",
              workerInstanceType: "t3.xlarge",
              baseMinMachines: 2, baseMaxMachines: 2,
              dataMinMachines: 3, dataMaxMachines: 5, dataCpu: 8, dataMemory: 32,
              isAddonEnabled: true, addonCpu: 4, addonMemory: 16,
              useSpot: false,
              isBackupEnabled: true, backupFrequency: "daily" as const
            };
            break;
          case "cost":
            presetSpecs = { 
              baseInstanceType: "t3.large",
              workerInstanceType: "t3.large",
              baseMinMachines: 1, baseMaxMachines: 1,
              dataMinMachines: 1, dataMaxMachines: 1, dataCpu: 2, dataMemory: 8,
              isAddonEnabled: false,
              useSpot: true,
              isBackupEnabled: true
            };
            break;
          default: // balanced
            presetSpecs = { 
              baseInstanceType: "t3.large",
              workerInstanceType: "t3.large",
              baseMinMachines: 1, baseMaxMachines: 1,
              dataMinMachines: 2, dataMaxMachines: 3, dataCpu: 4, dataMemory: 16,
              isAddonEnabled: true, addonCpu: 2, addonMemory: 8,
              useSpot: true,
              isBackupEnabled: true, backupFrequency: "daily" as const
            };
        }
        next = { ...next, ...presetSpecs };
      }

      // Force spot for Sandbox and disable addons ONLY in simple mode
      if (!next.isAdvancedMode && next.strategySize === "cost") {
        next.useSpot = true
        next.isAddonEnabled = false
      }

      localStorage.setItem("computeStrategyState", JSON.stringify(next))
      return next
    })
  }

  const allValid = true

  const specs = useMemo(() => {
    const getBaseResources = (type: string) => {
      if (type.includes("xlarge")) return { cpu: 4, mem: 16 }
      if (type.includes("large")) return { cpu: 2, mem: 8 }
      return { cpu: 2, mem: 4 } // medium
    }
    
    const baseRes = getBaseResources(state.baseInstanceType)

    return {
      base: { 
        min: state.baseMinMachines, 
        max: state.baseMaxMachines, 
        cpu: baseRes.cpu, 
        memory: baseRes.mem 
      },
      data: { 
        min: state.dataMinMachines, 
        max: state.dataMaxMachines, 
        cpu: state.dataCpu, 
        memory: state.dataMemory 
      },
      totalMin: (state.baseMinMachines * baseRes.cpu) + (state.dataMinMachines * state.dataCpu) + (state.isAddonEnabled ? state.addonCpu : 0),
      totalMax: (state.baseMaxMachines * baseRes.cpu) + (state.dataMaxMachines * state.dataCpu) + (state.isAddonEnabled ? state.addonCpu : 0)
    }
  }, [state.baseInstanceType, state.baseMinMachines, state.baseMaxMachines, state.dataMinMachines, state.dataMaxMachines, state.dataCpu, state.dataMemory, state.isAddonEnabled, state.addonCpu])

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">System Power & Scale</h1>
            </div>
            <p className="text-muted-foreground">
              Choose how much power your system needs. You can always change this later.
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
            We&apos;ve set sensible defaults — just pick a power level below and you&apos;re good to go.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in duration-500">
          <div className="space-y-12">
            {!state.isAdvancedMode ? (
              /* SIMPLE MODE */
              <div className="space-y-12">
                {/* Overall Strategy */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-lg">System Performance</h3>
                    <HelperTooltip text="Choose the overall power level for your system. Higher = faster and more users supported, but also more cost." />
                  </div>
                  <p className="text-sm text-muted-foreground">This controls how fast your system runs and how many users it can handle at once.</p>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <SelectionCard
                      selected={state.strategySize === "cost"}
                      onClick={() => updateState({ strategySize: "cost" })}
                      icon={DollarSign}
                      title="Sandbox"
                      description="Ideal for development and testing."
                    />
                    <SelectionCard
                      selected={state.strategySize === "balanced"}
                      onClick={() => updateState({ strategySize: "balanced" })}
                      recommended
                      icon={BarChart3}
                      title="Production"
                      description="Optimized for standard business workloads."
                    />
                    <SelectionCard
                      selected={state.strategySize === "high"}
                      onClick={() => updateState({ strategySize: "high" })}
                      icon={Zap}
                      title="Enterprise"
                      description="Maximum power for large-scale analytics."
                    />
                  </div>
                  
                  {/* Spot Optimization Card (Simple Mode) */}
                  <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between bg-emerald-50/20">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">Save Money on Computing</h4>
                          <p className="text-xs text-muted-foreground">Uses spare cloud capacity to cut costs by up to 70%. May occasionally restart — not recommended for critical workloads.</p>
                        </div>
                      </div>
                      {state.strategySize === "cost" ? (
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Always Enabled
                        </div>
                      ) : (
                        <Switch 
                          checked={state.useSpot} 
                          onCheckedChange={(v) => updateState({ useSpot: v })}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      )}
                    </div>
                  </Card>

                  {/* System Addons Card (Simple Mode) */}
                  {state.strategySize !== "cost" && (
                    <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                      <div className="p-6 flex items-center justify-between bg-emerald-50/20">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100">
                            <PlusSquare className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900">Enable Monitoring & Utilities</h4>
                            <p className="text-xs text-muted-foreground font-medium">Extra tools to help you track system health and automate tasks.</p>
                          </div>
                        </div>
                        <Switch 
                          checked={state.isAddonEnabled} 
                          onCheckedChange={(v) => {
                            const defaults = state.strategySize === "high" ? { addonCpu: 4, addonMemory: 16 } : { addonCpu: 2, addonMemory: 8 }
                            updateState({ isAddonEnabled: v, ...defaults })
                          }}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>
                    </Card>
                  )}

                  {/* Data Platform (Iceberg) Card (Simple Mode) */}
                  <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between bg-emerald-50/20">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 text-2xl">
                          🧊
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">Analytics & Data Tables</h4>
                          <p className="text-xs text-muted-foreground font-medium">High-performance analytics, ACID transactions, and reliable data lake management.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-semibold">{state.isIcebergEnabled ? "Enabled" : "Disabled"}</Label>
                        <Switch 
                          checked={state.isIcebergEnabled}
                          onCheckedChange={(v) => updateState({ isIcebergEnabled: v })}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>
                    </div>
                  </Card>
                </section>
              </div>
            ) : (
              /* ADVANCED MODE */
              <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">

                {/* Core System Servers */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      Core System Servers
                    </CardTitle>
                    <CardDescription>
                      Core system servers that keep your platform running. Recommended: t3.large (2 vCPU, 8GB).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Instance Type</Label>
                        <select 
                          value={state.baseInstanceType} 
                          onChange={(e) => updateState({ baseInstanceType: e.target.value })}
                          className="w-full h-11 rounded-xl bg-muted/50 border-2 border-transparent focus:border-blue-500 outline-none px-4 font-bold text-sm"
                        >
                          <option value="t3.medium">t3.medium (2 vCPU, 4GB)</option>
                          <option value="t3.large">t3.large (2 vCPU, 8GB)</option>
                          <option value="t3.xlarge">t3.xlarge (4 vCPU, 16GB)</option>
                          <option value="m5.large">m5.large (2 vCPU, 8GB)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Min</Label>
                            <span className="font-bold text-blue-600 text-xs">{state.baseMinMachines}</span>
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
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max</Label>
                            <span className="font-bold text-blue-600 text-xs">{state.baseMaxMachines}</span>
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
                    </div>
                  </CardContent>
                </Card>

                {/* Hyperlake Machines */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      Hyperlake Machines (Data Processing Servers)
                    </CardTitle>
                    <CardDescription>
                      Dedicated servers for data processing and analytics. Higher CPU/memory = faster queries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     <div className="grid sm:grid-cols-2 gap-8">
                       <div className="space-y-6">
                         <div className="space-y-4">
                           <div className="flex justify-between items-center">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Processing Power (CPU)</Label>
                             <span className="font-bold text-emerald-600 text-xs">{state.dataCpu} vCPU</span>
                           </div>
                           <Slider value={[state.dataCpu]} min={1} max={32} step={1} onValueChange={([v]) => updateState({ dataCpu: v })} />
                         </div>
                         <div className="space-y-4">
                           <div className="flex justify-between items-center">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Memory per Server</Label>
                             <span className="font-bold text-emerald-600 text-xs">{state.dataMemory} GB</span>
                           </div>
                           <Slider value={[state.dataMemory]} min={2} max={128} step={2} onValueChange={([v]) => updateState({ dataMemory: v })} />
                         </div>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Min Servers</Label>
                              <span className="font-bold text-emerald-600 text-xs">{state.dataMinMachines}</span>
                            </div>
                            <Slider
                              value={[state.dataMinMachines]}
                              min={1}
                              max={10}
                              step={1}
                              onValueChange={([val]) => updateState({ dataMinMachines: val })}
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max Servers</Label>
                              <span className="font-bold text-emerald-600 text-xs">{state.dataMaxMachines}</span>
                            </div>
                            <Slider
                              value={[state.dataMaxMachines]}
                              min={state.dataMinMachines}
                              max={100}
                              step={1}
                              onValueChange={([val]) => updateState({ dataMaxMachines: val })}
                            />
                          </div>
                       </div>
                     </div>

                    <div className="pt-6 border-t space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Enable Backups
                          </Label>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Automatically save copies of your data so nothing is lost</p>
                        </div>
                        <Switch
                          checked={state.isBackupEnabled}
                          onCheckedChange={(val) => updateState({ isBackupEnabled: val })}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>

                      {state.isBackupEnabled && (
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-500/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Backup Frequency</Label>
                          <div className="flex gap-2">
                            {["daily", "weekly"].map((f) => (
                              <Button
                                key={f}
                                variant={state.backupFrequency === f ? "default" : "outline"}
                                className={cn("flex-1 h-10 capitalize rounded-lg", state.backupFrequency === f && "bg-emerald-600 text-white")}
                                onClick={() => updateState({ backupFrequency: f as any })}
                              >
                                {f}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Infrastructure Extensions */}
                <div className="space-y-6">
                  {/* System Addons */}
                  <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl">
                            <PlusSquare className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">System Addons</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Optional utilities and extensions</p>
                          </div>
                        </div>
                        <Switch 
                          checked={state.isAddonEnabled} 
                          onCheckedChange={(v) => updateState({ isAddonEnabled: v })}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>
                      {state.isAddonEnabled && (
                        <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-emerald-500/5 animate-in slide-in-from-top-4 duration-500">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] font-bold uppercase tracking-widest">Addon CPU</Label>
                              <span className="font-bold text-emerald-600 text-xs">{state.addonCpu} vCPU</span>
                            </div>
                            <Slider value={[state.addonCpu]} min={1} max={16} step={1} onValueChange={([v]) => updateState({ addonCpu: v })} />
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] font-bold uppercase tracking-widest">Addon Memory</Label>
                              <span className="font-bold text-emerald-600 text-xs">{state.addonMemory} GB</span>
                            </div>
                            <Slider value={[state.addonMemory]} min={2} max={64} step={2} onValueChange={([v]) => updateState({ addonMemory: v })} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Spot Instances */}
                  <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                    <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Spot Instances</h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Cost-optimized compute capacity</p>
                        </div>
                      </div>
                      <Switch 
                        checked={state.useSpot} 
                        onCheckedChange={(v) => updateState({ useSpot: v })}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </Card>

                  {/* Data Platform (Iceberg) */}
                  <Card className="border-2 border-emerald-500/10 shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl text-xl">🧊</div>
                          <div>
                            <h3 className="font-bold text-lg">Data Platform (Iceberg)</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Lakehouse table format</p>
                          </div>
                        </div>
                        <Switch 
                          checked={state.isIcebergEnabled} 
                          onCheckedChange={(v) => updateState({ isIcebergEnabled: v })}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>

                      {state.isIcebergEnabled && (
                        <div className="space-y-8 pt-8 border-t border-emerald-500/5 animate-in slide-in-from-top-4 duration-500">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Storage size (GB)</Label>
                                <span className="text-sm font-bold text-blue-600">{state.icebergStorageSize} GB</span>
                              </div>
                              <Slider 
                                value={[state.icebergStorageSize]} 
                                min={20}
                                max={2000}
                                step={20}
                                onValueChange={([val]) => updateState({ icebergStorageSize: val })}
                              />
                           </div>

                           <div className="pt-6 border-t border-emerald-500/5 space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Enable Iceberg Backup
                                  </Label>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Automated point-in-time recovery</p>
                                </div>
                                <Switch
                                  checked={state.isIcebergBackupEnabled}
                                  onCheckedChange={(val) => updateState({ isIcebergBackupEnabled: val })}
                                  className="data-[state=checked]:bg-emerald-600"
                                />
                              </div>

                              {state.isIcebergBackupEnabled && (
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-500/10 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                   <div className="space-y-4">
                                      <Label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Backup Schedule</Label>
                                      <div className="flex gap-2">
                                        {["daily", "weekly"].map((s) => (
                                          <Button
                                            key={s}
                                            variant={state.icebergBackupSchedule === s ? "default" : "outline"}
                                            className={cn("flex-1 h-10 capitalize rounded-lg", state.icebergBackupSchedule === s && "bg-blue-600 text-white")}
                                            onClick={() => updateState({ icebergBackupSchedule: s })}
                                          >
                                            {s}
                                          </Button>
                                        ))}
                                      </div>
                                   </div>

                                   <div className="space-y-4">
                                      <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Data Retention</Label>
                                        <span className="text-sm font-bold text-blue-700">{state.icebergRetention} Days</span>
                                      </div>
                                      <Slider 
                                        value={[state.icebergRetention]} 
                                        min={1}
                                        max={365}
                                        step={1}
                                        onValueChange={([val]) => updateState({ icebergRetention: val })}
                                      />
                                   </div>
                                </div>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-8 space-y-6">
            {/* Combined Summary Card */}
            <Card className="bg-muted/30 border-2 border-emerald-500/10 shadow-xl shadow-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-700 uppercase tracking-wider font-bold">
                  <BarChart3 className="w-4 h-4" />
                  Combined Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">1. Base System</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{specs.base.min} machine</span>
                        <span className="text-xs text-muted-foreground">({specs.base.cpu} CPU)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2. Data Processing</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          {specs.data.min === specs.data.max 
                            ? `${specs.data.min} node` 
                            : `${specs.data.min} – ${specs.data.max} nodes`}
                        </span>
                        <span className="text-xs text-muted-foreground">({specs.data.cpu} CPU/node)</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-emerald-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">3. System Addons</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{state.isAddonEnabled ? "Enabled" : "Disabled"}</span>
                        {state.isAddonEnabled && (
                          <span className="text-xs text-muted-foreground">{state.addonCpu} CPU / {state.addonMemory}GB</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-emerald-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">4. Automated Backups</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{state.isBackupEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-emerald-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">5. Spot Optimization</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{state.useSpot ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-emerald-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">6. Data Platform</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{state.isIcebergEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                    <span className="text-[10px] uppercase font-bold tracking-widest mb-1 block opacity-80">Total Processing Capacity</span>
                    <div className="text-3xl font-black">
                      {specs.totalMin} → {specs.totalMax} CPU
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-start gap-2 pt-4 border-t border-dashed leading-relaxed">
                  <Info className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  Servers automatically scale based on how busy your system is.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 h-16">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/cluster-setup")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={() => router.push("/review")}
            disabled={!allValid}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 px-8 h-10"
          >
            Continue to Launch Review
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
