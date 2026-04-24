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
  Cpu,
  Layers,
  Activity,
  Server,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SystemSize = "standard" | "high" | "cost"

interface ScalingState {
  isAdvancedMode: boolean
  // Simple Mode
  systemSize: SystemSize
  // Advanced Mode - Core System (Admin Pool)
  coreMinMachines: number
  coreMaxMachines: number
  coreCpu: number
  coreMemory: number
  // Advanced Mode - Extra Capacity (Addon Pool)
  extraMinMachines: number
  extraMaxMachines: number
  extraCpu: number
  extraMemory: number
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

export function SystemScalingWizard() {
  const router = useRouter()
  const [state, setState] = useState<ScalingState>({
    isAdvancedMode: false,
    systemSize: "standard",
    coreMinMachines: 1,
    coreMaxMachines: 2,
    coreCpu: 2,
    coreMemory: 8,
    extraMinMachines: 0,
    extraMaxMachines: 2,
    extraCpu: 4,
    extraMemory: 16,
  })

  const updateState = (updates: Partial<ScalingState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const specs = useMemo(() => {
    if (state.isAdvancedMode) {
      return {
        core: { min: state.coreMinMachines, max: state.coreMaxMachines, cpu: state.coreCpu, memory: state.coreMemory },
        extra: { min: state.extraMinMachines, max: state.extraMaxMachines, cpu: state.extraCpu, memory: state.extraMemory }
      }
    }
    
    switch (state.systemSize) {
      case "high":
        return {
          core: { min: 2, max: 2, cpu: 4, memory: 16 },
          extra: { min: 0, max: 5, cpu: 8, memory: 32 }
        }
      case "cost":
        return {
          core: { min: 1, max: 1, cpu: 2, memory: 4 },
          extra: { min: 0, max: 1, cpu: 2, memory: 8 }
        }
      default: // standard
        return {
          core: { min: 1, max: 2, cpu: 2, memory: 8 },
          extra: { min: 0, max: 2, cpu: 4, memory: 16 }
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Cluster Setup</h1>
            </div>
            <p className="text-muted-foreground">
              Define how your core system capacity and scaling should behave.
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
        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            We&apos;ve selected the best setup for most users. You can continue without changing anything.
          </p>
        </div>

        <div className="space-y-8">
          {!state.isAdvancedMode ? (
            /* SIMPLE MODE */
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">System Size</h3>
                  <HelperTooltip text="Choose how powerful your system baseline should be." />
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectionCard
                    selected={state.systemSize === "standard"}
                    onClick={() => updateState({ systemSize: "standard" })}
                    recommended
                    icon={Server}
                    title="Standard"
                    description="Perfect for most production use cases."
                  />
                  <SelectionCard
                    selected={state.systemSize === "high"}
                    onClick={() => updateState({ systemSize: "high" })}
                    icon={Zap}
                    title="High Capacity"
                    description="For large-scale enterprise workloads."
                  />
                  <SelectionCard
                    selected={state.systemSize === "cost"}
                    onClick={() => updateState({ systemSize: "cost" })}
                    icon={DollarSign}
                    title="Cost Optimized"
                    description="Cheapest setup for small projects."
                  />
                </div>

                {/* Impact Card */}
                <Card className="bg-muted/30 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <BarChart3 className="w-4 h-4" />
                      What this means
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Scaling Range</span>
                          <span className="text-sm font-bold">{specs.core.min} – {specs.core.max + specs.extra.max} Machines</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{specs.core.min} always-on machine (core services)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Scales up to {specs.core.max + specs.extra.max} total machines</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <span className="text-xs text-muted-foreground block">Machine Specs</span>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold">{specs.core.cpu} CPU</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Per machine</span>
                          </div>
                          <div className="w-px h-10 bg-border" />
                          <div className="flex flex-col">
                            <span className="text-xl font-bold">{specs.core.memory} GB</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Memory</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-muted-foreground/20">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        Your system automatically adds machines when needed and removes them when idle.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          ) : (
            /* ADVANCED MODE */
            <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Core System Machines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Core System Machines
                  </CardTitle>
                  <CardDescription>
                    These machines run essential system services and are always running.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Min machines</Label>
                        <span className="font-bold text-blue-600">{state.coreMinMachines}</span>
                      </div>
                      <Slider
                        value={[state.coreMinMachines]}
                        min={1}
                        max={3}
                        step={1}
                        onValueChange={([val]) => updateState({ coreMinMachines: val })}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Max machines</Label>
                        <span className="font-bold text-blue-600">{state.coreMaxMachines}</span>
                      </div>
                      <Slider
                        value={[state.coreMaxMachines]}
                        min={state.coreMinMachines}
                        max={5}
                        step={1}
                        onValueChange={([val]) => updateState({ coreMaxMachines: val })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>CPU per machine</Label>
                      <Input 
                        type="number" 
                        value={state.coreCpu} 
                        onChange={(e) => updateState({ coreCpu: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory (GB)</Label>
                      <Input 
                        type="number" 
                        value={state.coreMemory} 
                        onChange={(e) => updateState({ coreMemory: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extra Capacity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Extra capacity for additional workloads
                  </CardTitle>
                  <CardDescription>
                    These machines only run when needed and scale down to zero when idle.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Maximum machines</Label>
                      <Input 
                        type="number" 
                        value={state.extraMaxMachines} 
                        onChange={(e) => updateState({ extraMaxMachines: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2 pt-8">
                       <p className="text-xs text-muted-foreground">
                         These scale to 0 automatically when no extra work is present.
                       </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>CPU per machine</Label>
                      <Input 
                        type="number" 
                        value={state.extraCpu} 
                        onChange={(e) => updateState({ extraCpu: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory (GB)</Label>
                      <Input 
                        type="number" 
                        value={state.extraMemory} 
                        onChange={(e) => updateState({ extraMemory: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity Summary */}
              <Card className="bg-blue-50/50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-wider text-blue-700">Capacity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-xs text-blue-600 font-bold block uppercase tracking-wider">Baseline</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-blue-900">{state.coreMinMachines} machine</span>
                          <span className="text-sm text-blue-700">(Always running)</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-bold text-blue-900">{state.coreMinMachines * state.coreCpu} CPU total</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                      <div className="space-y-1">
                        <span className="text-xs text-blue-600 font-bold block uppercase tracking-wider">Maximum Scale</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-blue-900">{state.coreMaxMachines + state.extraMaxMachines} machines total</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-bold text-blue-900">{(state.coreMaxMachines * state.coreCpu) + (state.extraMaxMachines * state.extraCpu)} CPU capacity</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 pt-2 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />
                      Extra machines are only used when your workload increases.
                    </p>
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
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2 px-8" 
              size="lg"
              onClick={() => router.push("/review")}
            >
              Finish Cluster Setup
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
