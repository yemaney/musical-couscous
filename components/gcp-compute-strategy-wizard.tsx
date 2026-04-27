"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Info,
  Settings2,
  CheckCircle2,
  Circle,
  Activity,
  Box,
  Lock,
  Clock,
  LayoutGrid,
  Server,
  PlusSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

type PresetType = "balanced" | "high" | "cost"
type DataSafety = "standard" | "high"
type DataRetention = 7 | 30 | 90

interface HyperlakeState {
  preset: PresetType
  machineType: string
  minNodes: number
  maxNodes: number
  backupSchedule: "daily" | "weekly"
  dataSafety: DataSafety
  dataRetention: DataRetention
  isAdvancedMode: boolean
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
  baseMachineType: string
  baseMinNodes: number
  baseMaxNodes: number
  isBackupEnabled: boolean
}

function PerformanceCard({
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
        "relative flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-300 group min-h-[160px]",
        selected
          ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
          : "border-border bg-card hover:border-blue-500/20 hover:bg-blue-50/30"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-4 px-3 py-1 text-[10px] font-black bg-blue-500 text-white rounded-full uppercase tracking-widest shadow-sm">
          Recommended
        </span>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground group-hover:text-blue-500"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? "border-blue-500 bg-blue-500 text-white" : "border-muted-foreground/20"
        )}>
          {selected && <CheckCircle2 className="w-4 h-4" />}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className={cn("font-bold text-base", selected ? "text-blue-900" : "text-foreground")}>
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  )
}

export function GCPComputeStrategyWizard() {
  const router = useRouter()
  const [state, setState] = useState<HyperlakeState>({
    preset: "balanced",
    machineType: "n2-standard-4",
    minNodes: 2,
    maxNodes: 3,
    backupSchedule: "daily",
    dataSafety: "standard",
    dataRetention: 30,
    isAdvancedMode: false,
    isIcebergEnabled: false,
    isIcebergBackupEnabled: false,
    icebergStorageSize: 100,
    icebergRetention: 30,
    icebergBackupSchedule: "daily",
    isAddonEnabled: true,
    addonCpu: 2,
    addonMemory: 8,
    useSpot: true,
    baseMachineType: "n2-standard-2",
    baseMinNodes: 1,
    baseMaxNodes: 1,
    isBackupEnabled: true,
  })

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("gcpComputeStrategyState")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migration: If user has old default min/max nodes, reset to new standards
        if (parsed.preset === "balanced" && (parsed.minNodes === 1 || parsed.baseMaxNodes === 2)) {
          setState({ ...parsed, baseMinNodes: 1, baseMaxNodes: 1, minNodes: 2, maxNodes: 3, isAddonEnabled: true, addonCpu: 2, isBackupEnabled: true })
        } else {
          setState(parsed)
        }
      } catch (e) {
        console.error("Failed to parse saved state", e)
      }
    }
    setIsLoaded(true)
  }, [])

  const updateState = (updates: Partial<HyperlakeState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates }
      
      // Force spot for Sandbox and disable addons ONLY in simple mode
      if (!next.isAdvancedMode && next.preset === "cost") {
        next.useSpot = true
        next.isAddonEnabled = false
      }

      localStorage.setItem("gcpComputeStrategyState", JSON.stringify(next))
      return next
    })
  }

  const handlePresetSelect = (preset: PresetType) => {
    const presets = {
      balanced: { 
        machineType: "n2-standard-4", minNodes: 2, maxNodes: 3,
        baseMachineType: "n2-standard-2", baseMinNodes: 1, baseMaxNodes: 1,
        isAddonEnabled: true, addonCpu: 2, addonMemory: 8,
        useSpot: true,
        isBackupEnabled: true, backupSchedule: "daily" as const
      },
      high: { 
        machineType: "n2-standard-8", minNodes: 3, maxNodes: 5,
        baseMachineType: "n2-standard-4", baseMinNodes: 2, baseMaxNodes: 2,
        isAddonEnabled: true, addonCpu: 4, addonMemory: 16,
        useSpot: false,
        isBackupEnabled: true, backupSchedule: "daily" as const
      },
      cost: { 
        machineType: "e2-standard-2", minNodes: 1, maxNodes: 1,
        baseMachineType: "e2-standard-2", baseMinNodes: 1, baseMaxNodes: 1,
        isAddonEnabled: false,
        useSpot: true,
        isBackupEnabled: true
      },
    }
    setState(prev => {
      const next = {
        ...prev,
        preset,
        ...presets[preset]
      }
      localStorage.setItem("gcpComputeStrategyState", JSON.stringify(next))
      return next
    })
  }

  const capacityInfo = useMemo(() => {
    const getRes = (type: string) => {
      if (type.includes("-8")) return { cpu: 8, mem: 32 }
      if (type.includes("-4")) return { cpu: 4, mem: 16 }
      return { cpu: 2, mem: 8 }
    }
    const base = getRes(state.baseMachineType)
    const worker = getRes(state.machineType)
    
    const minCpu = (state.baseMinNodes * base.cpu) + (state.minNodes * worker.cpu) + (state.isAddonEnabled ? state.addonCpu : 0)
    const maxCpu = (state.baseMaxNodes * base.cpu) + (state.maxNodes * worker.cpu) + (state.isAddonEnabled ? state.addonCpu : 0)
    
    return { minCpu, maxCpu, base, worker }
  }, [state.baseMachineType, state.machineType, state.baseMinNodes, state.baseMaxNodes, state.minNodes, state.maxNodes, state.isAddonEnabled, state.addonCpu])

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Compute Strategy</h1>
              <p className="text-muted-foreground font-medium">Define how your system capacity and data processing should behave.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Advanced Mode</span>
            <Switch checked={state.isAdvancedMode} onCheckedChange={(val) => updateState({ isAdvancedMode: val })} />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in duration-500">
          <div className="space-y-12">
            {!state.isAdvancedMode ? (
              /* SIMPLE MODE CONTENT */
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Performance Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-slate-900">System Performance</h3>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <PerformanceCard
                      selected={state.preset === "cost"}
                      onClick={() => handlePresetSelect("cost")}
                      icon={DollarSign}
                      title="Sandbox"
                      description="Ideal for development and testing."
                    />
                    <PerformanceCard
                      selected={state.preset === "balanced"}
                      onClick={() => handlePresetSelect("balanced")}
                      recommended
                      icon={BarChart3}
                      title="Production"
                      description="Optimized for standard business workloads."
                    />
                    <PerformanceCard
                      selected={state.preset === "high"}
                      onClick={() => handlePresetSelect("high")}
                      icon={Zap}
                      title="Enterprise"
                      description="Maximum power for large-scale analytics."
                    />
                  </div>
                  
                  {/* Spot Optimization Card (Simple Mode) */}
                  <Card className="border-2 border-blue-500/10 shadow-sm overflow-hidden rounded-[24px]">
                    <div className="p-6 flex items-center justify-between bg-blue-50/10">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900">Spot Instance Optimization</h4>
                          <p className="text-xs text-muted-foreground font-medium">Reduce compute costs significantly using spare capacity.</p>
                        </div>
                      </div>
                      {state.preset === "cost" ? (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Always Enabled
                        </div>
                      ) : (
                        <Switch 
                          checked={state.useSpot} 
                          onCheckedChange={(v) => updateState({ useSpot: v })}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      )}
                    </div>
                  </Card>

                  {/* System Addons Card (Simple Mode) */}
                  {state.preset !== "cost" && (
                    <Card className="border-2 border-blue-500/10 shadow-sm overflow-hidden rounded-[24px]">
                      <div className="p-6 flex items-center justify-between bg-blue-50/10">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100">
                            <PlusSquare className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900">Enable System Addons</h4>
                            <p className="text-xs text-muted-foreground font-medium">Deploy optional utilities and system monitoring services.</p>
                          </div>
                        </div>
                        <Switch 
                          checked={state.isAddonEnabled} 
                          onCheckedChange={(v) => {
                            const defaults = state.preset === "high" ? { addonCpu: 4, addonMemory: 16 } : { addonCpu: 2, addonMemory: 8 }
                            updateState({ isAddonEnabled: v, ...defaults })
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </Card>
                  )}

                  {/* Data Platform (Iceberg) Card (Simple Mode) */}
                  <Card className="overflow-hidden border-2 border-blue-500/5 bg-blue-50/5 rounded-[32px]">
                    <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-blue-100">
                          🧊
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900">Data Platform (Iceberg)</h3>
                          <p className="text-sm text-muted-foreground font-medium max-w-md">
                            High-performance analytics, ACID transactions, and reliable data lake management.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-blue-100">
                        <span className="text-sm font-bold text-blue-900">{state.isIcebergEnabled ? "Enabled" : "Disabled"}</span>
                        <Switch 
                          checked={state.isIcebergEnabled}
                          onCheckedChange={(v) => updateState({ isIcebergEnabled: v })}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              /* ADVANCED MODE CONTENT */
              <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
                 {/* Base System Machines */}
                 <Card className="border-2 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 font-black text-slate-900">
                        <Server className="w-5 h-5 text-blue-600" />
                        Base System Machines
                      </CardTitle>
                      <CardDescription className="font-medium text-xs">
                        Core system nodes. Recommended: n2-standard-2 (2 vCPU, 8GB).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">GCP Machine Type</Label>
                        <select 
                          value={state.baseMachineType} 
                          onChange={(e) => updateState({ baseMachineType: e.target.value })}
                          className="w-full h-12 rounded-xl bg-muted/20 border-2 border-transparent focus:border-blue-500 outline-none px-4 font-bold text-sm"
                        >
                          <option value="n2-standard-2">n2-standard-2 (2 vCPU, 8GB)</option>
                          <option value="n2-standard-4">n2-standard-4 (4 vCPU, 16GB)</option>
                          <option value="e2-standard-2">e2-standard-2 (Cost Optimized)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Min</Label>
                            <span className="font-black text-blue-600 text-xs">{state.baseMinNodes}</span>
                          </div>
                          <Slider value={[state.baseMinNodes]} onValueChange={([v]) => updateState({ baseMinNodes: v })} min={1} max={3} step={1} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Max</Label>
                            <span className="font-black text-blue-600 text-xs">{state.baseMaxNodes}</span>
                          </div>
                          <Slider value={[state.baseMaxNodes]} onValueChange={([v]) => updateState({ baseMaxNodes: v })} min={state.baseMinNodes} max={5} step={1} />
                        </div>
                      </div>
                    </CardContent>
                 </Card>

                 {/* Hyperlake Machines */}
                 <Card className="border-2 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 font-black text-slate-900">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        Hyperlake Machines
                      </CardTitle>
                      <CardDescription className="font-medium text-xs">
                        Dedicated nodes for data processing and analytics workloads.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-8">
                      <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Worker Machine Type</Label>
                          <select 
                            value={state.machineType} 
                            onChange={(e) => updateState({ machineType: e.target.value })}
                            className="w-full h-12 rounded-xl bg-muted/20 border-2 border-transparent focus:border-emerald-500 outline-none px-4 font-bold text-sm"
                          >
                            <option value="n2-standard-2">n2-standard-2 (2 vCPU, 8GB)</option>
                            <option value="n2-standard-4">n2-standard-4 (4 vCPU, 16GB)</option>
                            <option value="n2-standard-8">n2-standard-8 (8 vCPU, 32GB)</option>
                            <option value="c2-standard-4">c2-standard-4 (Performance)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Min</Label>
                              <span className="font-black text-emerald-600 text-xs">{state.minNodes}</span>
                            </div>
                            <Slider value={[state.minNodes]} onValueChange={([v]) => updateState({ minNodes: v })} min={1} max={10} step={1} />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Max</Label>
                              <span className="font-black text-emerald-600 text-xs">{state.maxNodes}</span>
                            </div>
                            <Slider value={[state.maxNodes]} onValueChange={([v]) => updateState({ maxNodes: v })} min={state.minNodes} max={100} step={1} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Enable Backups
                            </Label>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Automated system recovery</p>
                          </div>
                          <Switch
                            checked={state.isBackupEnabled}
                            onCheckedChange={(val) => updateState({ isBackupEnabled: val })}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                        </div>

                        {state.isBackupEnabled && (
                          <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-500/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <Label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Backup Frequency</Label>
                            <div className="flex gap-2">
                              <Button
                                variant={state.backupSchedule === "daily" ? "default" : "outline"}
                                className={cn("flex-1 h-10 rounded-lg", state.backupSchedule === "daily" && "bg-emerald-600 text-white")}
                                onClick={() => updateState({ backupSchedule: "daily" })}
                              >Daily</Button>
                              <Button
                                variant={state.backupSchedule === "weekly" ? "default" : "outline"}
                                className={cn("flex-1 h-10 rounded-lg", state.backupSchedule === "weekly" && "bg-emerald-600 text-white")}
                                onClick={() => updateState({ backupSchedule: "weekly" })}
                              >Weekly</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                 </Card>

                 {/* Infrastructure Extensions */}
                 <div className="space-y-6">
                    {/* System Addons (Card) */}
                    <Card className="border-2 border-blue-500/10 shadow-lg shadow-blue-500/5 rounded-[32px] overflow-hidden">
                      <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                              <PlusSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900">System Addons</h3>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Optional extensions</p>
                            </div>
                          </div>
                          <Switch 
                            checked={state.isAddonEnabled} 
                            onCheckedChange={(v) => updateState({ isAddonEnabled: v })}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        {state.isAddonEnabled && (
                          <div className="grid sm:grid-cols-2 gap-10 pt-8 border-t border-blue-100 animate-in slide-in-from-top-4 duration-500">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Addon CPU Limit</Label>
                                <span className="font-black text-blue-600 text-xs">{state.addonCpu} vCPU</span>
                              </div>
                              <Slider value={[state.addonCpu]} min={1} max={16} step={1} onValueChange={([v]) => updateState({ addonCpu: v })} />
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Addon Memory</Label>
                                <span className="font-black text-blue-600 text-xs">{state.addonMemory} GB</span>
                              </div>
                              <Slider value={[state.addonMemory]} min={2} max={64} step={2} onValueChange={([v]) => updateState({ addonMemory: v })} />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Spot Instances (Only for Production/Enterprise) */}
                    {state.preset !== "cost" && (
                      <Card className="border-2 border-blue-500/10 shadow-lg shadow-blue-500/5 rounded-[32px] overflow-hidden">
                        <div className="p-8 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900">Spot Instances</h3>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Capacity Optimization</p>
                              </div>
                            </div>
                            <Switch 
                              checked={state.useSpot} 
                              onCheckedChange={(v) => updateState({ useSpot: v })}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Utilize spare GCP capacity at significant discounts. Ideal for stateless Trino workers and data processing workloads.
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Advanced Iceberg Card */}
                    <Card className={cn(
                      "border-2 rounded-2xl transition-all duration-300",
                      state.isIcebergEnabled ? "border-blue-500 bg-blue-50/10" : "border-border"
                    )}>
                      <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🧊</span>
                              <div>
                                  <h3 className="text-lg font-bold text-slate-900">Iceberg Data Platform</h3>
                                  <p className="text-xs text-muted-foreground">Advanced storage & analytics platform</p>
                              </div>
                            </div>
                            <Switch 
                              checked={state.isIcebergEnabled}
                              onCheckedChange={(val) => updateState({ isIcebergEnabled: val })}
                            />
                        </div>

                      {state.isIcebergEnabled && (
                        <div className="space-y-8 pt-8 border-t border-blue-100 animate-in slide-in-from-top-4 duration-500">
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

                           <div className="pt-6 border-t border-blue-100 space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label className="text-sm font-bold flex items-center gap-2 text-blue-900">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    Enable Iceberg Backup
                                  </Label>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Automated point-in-time recovery</p>
                                </div>
                                <Switch
                                  checked={state.isIcebergBackupEnabled}
                                  onCheckedChange={(val) => updateState({ isIcebergBackupEnabled: val })}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </div>

                              {state.isIcebergBackupEnabled && (
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-500/10 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                   <div className="space-y-4">
                                      <Label className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Backup Schedule</Label>
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
                                        <Label className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Data Retention</Label>
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
            <Card className="overflow-hidden border-2 border-blue-500/5 bg-blue-50/10 rounded-[40px] shadow-2xl shadow-blue-500/5">
              <CardContent className="p-10 space-y-10">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                  <LayoutGrid className="w-4 h-4" /> Combined Summary
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">1. Base System</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{state.baseMinNodes} machine</span>
                      <span className="text-sm text-muted-foreground font-medium">({capacityInfo.base.cpu} CPU)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">2. Data Processing</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {state.minNodes === state.maxNodes 
                          ? `${state.minNodes} node` 
                          : `${state.minNodes} – ${state.maxNodes} nodes`}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">({capacityInfo.worker.cpu} CPU/node)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">3. System Addons</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{state.isAddonEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">4. Automated Backups</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{state.isBackupEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">5. Spot Optimization</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{state.useSpot ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">6. Data Platform</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{state.isIcebergEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-600/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Capacity Range</p>
                  <p className="text-4xl font-black tracking-tighter">
                    {capacityInfo.minCpu} → {capacityInfo.maxCpu} CPU
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-blue-100 text-muted-foreground">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed">Automatic scaling based on processing workload.</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>


          <div className="pt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
            <Button variant="ghost" onClick={() => router.back()} className="h-14 px-8 font-bold text-muted-foreground hover:text-blue-600">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-3 px-12 h-16 rounded-3xl shadow-2xl shadow-blue-600/40 font-black transition-all active:scale-95" 
              size="lg" 
              onClick={() => router.push("/gcp/review")}
            >
              Continue to Review <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
  )
}
