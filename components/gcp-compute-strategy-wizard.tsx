"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    machineType: "n2-standard-2",
    minNodes: 2,
    maxNodes: 10,
    backupSchedule: "daily",
    dataSafety: "standard",
    dataRetention: 30,
    isAdvancedMode: false,
  })

  const updateState = (updates: Partial<HyperlakeState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const handlePresetSelect = (preset: PresetType) => {
    const presets = {
      balanced: { machineType: "n2-standard-2", minNodes: 2, maxNodes: 10 },
      high: { machineType: "c2-standard-4", minNodes: 4, maxNodes: 20 },
      cost: { machineType: "e2-standard-2", minNodes: 1, maxNodes: 5 },
    }
    setState(prev => ({
      ...prev,
      preset,
      ...presets[preset]
    }))
  }

  const capacityInfo = useMemo(() => {
    const cpuPerNode = state.machineType.includes("-4") ? 4 : 2
    const minCpu = (1 + state.minNodes) * cpuPerNode
    const maxCpu = (1 + state.maxNodes) * cpuPerNode
    return { minCpu, maxCpu }
  }, [state.machineType, state.minNodes, state.maxNodes])

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-4 py-12">
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

        {/* Banner */}
        <div className="mb-10 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-800">
          <Info className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm font-medium">We've combined system and data processing into one simple strategy.</p>
        </div>

        <div className="space-y-12">
          {/* Performance Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Activity className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">System Performance</h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <PerformanceCard
                selected={state.preset === "balanced"}
                onClick={() => handlePresetSelect("balanced")}
                recommended
                icon={BarChart3}
                title="Balanced"
                description="Optimized for consistent performance."
              />
              <PerformanceCard
                selected={state.preset === "high"}
                onClick={() => handlePresetSelect("high")}
                icon={Zap}
                title="High Power"
                description="Maximum speed for heavy workloads."
              />
              <PerformanceCard
                selected={state.preset === "cost"}
                onClick={() => handlePresetSelect("cost")}
                icon={DollarSign}
                title="Cost Saving"
                description="Minimal spend for smaller projects."
              />
            </div>
          </div>

          {/* Combined Summary Section */}
          {!state.isAdvancedMode && (
            <Card className="overflow-hidden border-2 border-blue-500/5 bg-blue-50/10 rounded-[32px]">
              <CardContent className="p-10 space-y-10">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                  <LayoutGrid className="w-4 h-4" /> Combined Summary
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">1. Base System (Always Running)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">1 machine</span>
                        <span className="text-sm text-muted-foreground font-medium">Runs core services</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">2. Data Processing (Hyperlake)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{state.minNodes} – {state.maxNodes} machines</span>
                        <span className="text-sm text-muted-foreground font-medium">Scales with workload</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
                      <div className="text-center space-y-2 mb-6">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Capacity Range</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter">
                          {capacityInfo.minCpu} <span className="text-blue-200">→</span> {capacityInfo.maxCpu} CPU
                        </p>
                      </div>
                      <div className="h-2 bg-blue-50 rounded-full overflow-hidden w-full max-w-[240px] mx-auto">
                        <div className="h-full bg-blue-500 rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-blue-100 text-muted-foreground">
                  <Info className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-medium">Your system automatically adds machines for data processing when needed and removes them when idle.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Mode Controls */}
          {state.isAdvancedMode && (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
               <Card className="border-2 rounded-2xl">
                  <CardContent className="pt-6 grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">GCP Machine Type</Label>
                      <select 
                        value={state.machineType} 
                        onChange={(e) => updateState({ machineType: e.target.value })}
                        className="w-full h-12 rounded-xl bg-muted/20 border-2 border-transparent focus:border-blue-500 outline-none px-4 font-bold text-sm"
                      >
                        <option value="n2-standard-2">n2-standard-2 (2 vCPU, 8GB)</option>
                        <option value="n2-standard-4">n2-standard-4 (4 vCPU, 16GB)</option>
                        <option value="c2-standard-4">c2-standard-4 (Performance)</option>
                        <option value="e2-standard-2">e2-standard-2 (Cost)</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Worker Scaling</Label>
                      <div className="flex items-center gap-6 pt-1">
                        <span className="text-xl font-black whitespace-nowrap">{state.minNodes}-{state.maxNodes} Nodes</span>
                        <Slider value={[state.maxNodes]} onValueChange={([v]) => updateState({ maxNodes: v })} min={2} max={100} step={1} className="flex-1" />
                      </div>
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {/* Data Safety & Data Retention Section */}
          <div className="grid md:grid-cols-2 gap-12 pt-8 border-t">
            {/* Data Safety */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Data Safety</h3>
              </div>
              <div className="flex gap-4">
                <button 
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-bold transition-all border-2",
                    state.dataSafety === "standard" 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                      : "bg-white text-slate-900 border-border hover:border-blue-500/30"
                  )}
                  onClick={() => updateState({ dataSafety: "standard" })}
                >
                  Standard
                </button>
                <button 
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-bold transition-all border-2",
                    state.dataSafety === "high" 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                      : "bg-white text-slate-900 border-border hover:border-blue-500/30"
                  )}
                  onClick={() => updateState({ dataSafety: "high" })}
                >
                  High Protection
                </button>
              </div>
            </div>

            {/* Data Retention */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <LayoutGrid className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Data Retention</h3>
              </div>
              <div className="flex gap-3">
                {[7, 30, 90].map((days) => (
                  <button 
                    key={days}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-bold transition-all border-2 text-sm",
                      state.dataRetention === days 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                        : "bg-white text-slate-900 border-border hover:border-blue-500/30"
                    )}
                    onClick={() => updateState({ dataRetention: days as DataRetention })}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
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
    </div>
  )
}
