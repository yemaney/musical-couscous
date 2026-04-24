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
  Clock,
  CheckCircle2,
  Circle,
  HelpCircle,
  HardDrive,
  Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type DataSafety = "standard" | "high"
type Performance = "balanced" | "high" | "cost"
type DataVolume = "small" | "medium" | "large"

interface HyperlakeState {
  isAdvancedMode: boolean
  // Simple Mode
  dataSafety: DataSafety
  performance: Performance
  dataVolume: DataVolume
  isStorageAdvancedExpanded: boolean
  // Advanced Mode
  cpuPerMachine: number
  memoryPerMachine: number
  minNodes: number
  maxNodes: number
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

export function HyperlakeSetupWizard() {
  const router = useRouter()
  const [state, setState] = useState<HyperlakeState>({
    isAdvancedMode: false,
    dataSafety: "standard",
    performance: "balanced",
    dataVolume: "medium",
    isStorageAdvancedExpanded: false,
    cpuPerMachine: 4,
    memoryPerMachine: 16,
    minNodes: 1,
    maxNodes: 5,
    backupFrequency: "daily",
    storageSize: 100,
    dataRetention: 30,
  })

  const updateState = (updates: Partial<HyperlakeState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  // Map performance modes to underlying infra values
  const performanceSpecs = useMemo(() => {
    if (state.isAdvancedMode) {
      return {
        min: state.minNodes,
        max: state.maxNodes,
        cpu: state.cpuPerMachine,
        memory: state.memoryPerMachine
      }
    }
    
    switch (state.performance) {
      case "high":
        return { min: 2, max: 10, cpu: 8, memory: 32 }
      case "cost":
        return { min: 1, max: 3, cpu: 2, memory: 8 }
      default: // balanced
        return { min: 1, max: 5, cpu: 4, memory: 16 }
    }
  }, [state.performance, state.isAdvancedMode, state.minNodes, state.maxNodes, state.cpuPerMachine, state.memoryPerMachine])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Hyperlake Setup</h1>
            </div>
            <p className="text-muted-foreground">
              Hyperlake lets you quickly query and analyze all your data in one place.
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
            We&apos;ve selected the best settings for most users. You can continue without changing anything.
          </p>
        </div>

        <div className="space-y-8">
          {!state.isAdvancedMode ? (
            /* SIMPLE MODE */
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Performance & Scale */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg">Performance & Scale</h3>
                  <HelperTooltip text="Determines how fast your queries run and how many users can query simultaneously." />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectionCard
                    selected={state.performance === "balanced"}
                    onClick={() => updateState({ performance: "balanced" })}
                    recommended
                    icon={BarChart3}
                    title="Balanced"
                    description="Optimized for mixed workloads."
                  />
                  <SelectionCard
                    selected={state.performance === "high"}
                    onClick={() => updateState({ performance: "high" })}
                    icon={Zap}
                    title="High"
                    description="Fastest query execution."
                  />
                  <SelectionCard
                    selected={state.performance === "cost"}
                    onClick={() => updateState({ performance: "cost" })}
                    icon={DollarSign}
                    title="Cost"
                    description="Lower monthly spend."
                  />
                </div>

                {/* What this means display */}
                <div className="mt-6 p-6 bg-muted/30 rounded-2xl border border-dashed space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    What this means
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground block">Scaling Capacity</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{performanceSpecs.min} – {performanceSpecs.max}</span>
                        <span className="text-sm text-muted-foreground">Machines</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500/20" style={{ width: `${(performanceSpecs.min / 10) * 100}%` }} />
                        <div className="h-full bg-emerald-500" style={{ width: `${((performanceSpecs.max - performanceSpecs.min) / 10) * 100}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2 text-right sm:text-left">
                      <span className="text-xs text-muted-foreground block">Per Machine Specs</span>
                      <div className="flex items-center justify-end sm:justify-start gap-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">{performanceSpecs.cpu} CPU</span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">{performanceSpecs.memory} GB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t border-dashed">
                    <Info className="w-3.5 h-3.5" />
                    We automatically add or remove machines based on usage to keep your system efficient.
                  </p>
                </div>
              </section>

              {/* Data Safety */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg">Data Safety</h3>
                  <HelperTooltip text="Controls how your data is backed up and protected against accidental loss." />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectionCard
                    selected={state.dataSafety === "standard"}
                    onClick={() => updateState({ dataSafety: "standard" })}
                    recommended
                    icon={CheckCircle2}
                    title="Standard"
                    description="Automated daily backups with easy recovery for any data loss scenario."
                  />
                  <SelectionCard
                    selected={state.dataSafety === "high"}
                    onClick={() => updateState({ dataSafety: "high" })}
                    icon={ShieldCheck}
                    title="High Protection"
                    description="More frequent backups and multi-region redundancy for critical workloads."
                  />
                </div>
              </section>

              {/* Data Storage */}
              <section className="space-y-6 pb-4">
                <div className="flex items-center border-b pb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-lg">Data Storage</h3>
                    <HelperTooltip text="We automatically manage how your data is stored and optimized." />
                  </div>
                </div>

                <div className="grid gap-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">How long should your data be kept?</Label>
                    <div className="flex gap-2">
                      {[7, 30, 90].map((days) => (
                        <Button
                          key={days}
                          variant={state.dataRetention === days ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-12 rounded-xl",
                            state.dataRetention === days && "bg-emerald-600 hover:bg-emerald-700"
                          )}
                          onClick={() => updateState({ dataRetention: days })}
                        >
                          {days} Days {days === 30 && "(Recommended)"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">How much data do you expect?</Label>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as DataVolume[]).map((v) => (
                        <Button
                          key={v}
                          variant={state.dataVolume === v ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-12 rounded-xl capitalize",
                            state.dataVolume === v && "bg-emerald-600 hover:bg-emerald-700"
                          )}
                          onClick={() => updateState({ dataVolume: v })}
                        >
                          {v} {v === "medium" && "(Recommended)"}
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
              {/* Compute Resources */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Compute Resources
                  </CardTitle>
                  <CardDescription>
                    Configure the specific hardware size for each machine in your system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" /> CPU per machine
                        </Label>
                        <span className="font-bold text-emerald-600">{state.cpuPerMachine} vCPU</span>
                      </div>
                      <Slider
                        value={[state.cpuPerMachine]}
                        min={2}
                        max={32}
                        step={2}
                        onValueChange={([val]) => updateState({ cpuPerMachine: val })}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <Database className="w-4 h-4" /> Memory per machine
                        </Label>
                        <span className="font-bold text-emerald-600">{state.memoryPerMachine} GB</span>
                      </div>
                      <Slider
                        value={[state.memoryPerMachine]}
                        min={4}
                        max={128}
                        step={4}
                        onValueChange={([val]) => updateState({ memoryPerMachine: val })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scaling Limits */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Maximize2 className="w-5 h-5" />
                    Scaling Limits
                  </CardTitle>
                  <CardDescription>
                    Set how many machines your system should use. It will automatically scale between these values.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Minimum machines</Label>
                      <Input 
                        type="number" 
                        value={state.minNodes} 
                        onChange={(e) => updateState({ minNodes: Math.max(1, parseInt(e.target.value)) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum machines</Label>
                      <Input 
                        type="number" 
                        value={state.maxNodes} 
                        onChange={(e) => updateState({ maxNodes: Math.max(state.minNodes, parseInt(e.target.value)) })}
                      />
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                      <span>Low Scale</span>
                      <span>High Scale</span>
                    </div>
                    <div className="relative h-6 bg-muted rounded-lg flex items-center px-2">
                      <div className="absolute h-1.5 bg-emerald-500 rounded-full" 
                        style={{ 
                          left: `${(state.minNodes / 20) * 100}%`,
                          right: `${100 - (state.maxNodes / 20) * 100}%`
                        }} 
                      />
                      <div className="w-full flex justify-between px-1 relative z-10">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-0.5 h-1 bg-muted-foreground/30 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-medium px-1">
                      <span>{state.minNodes} machine{state.minNodes !== 1 && 's'}</span>
                      <span>{state.maxNodes} machine{state.maxNodes !== 1 && 's'}</span>
                    </div>
                  </div>

                  {/* Live Capacity Summary */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Live Capacity Range</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{state.minNodes} machine{state.minNodes !== 1 && 's'} → {state.minNodes * state.cpuPerMachine} CPU total</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{state.maxNodes} machine{state.maxNodes !== 1 && 's'} → {state.maxNodes * state.cpuPerMachine} CPU total</span>
                      </div>
                    </div>
                    <HelperTooltip text="Your system will automatically scale between these values depending on demand." />
                  </div>
                </CardContent>
              </Card>

              {/* Data Storage Advanced */}
              <Card className="border-emerald-500/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-emerald-600" />
                      Data Storage (Advanced)
                      <HelperTooltip text="Powered by Apache Iceberg (an advanced data format used by modern data platforms)" />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Your data is stored using a high-performance format that keeps it fast, reliable, and easy to manage as it grows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center group py-6 px-4 bg-muted/20 hover:bg-muted/40 rounded-xl"
                    onClick={() => updateState({ isStorageAdvancedExpanded: !state.isStorageAdvancedExpanded })}
                  >
                    <span className="font-medium">Advanced storage settings</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      state.isStorageAdvancedExpanded && "rotate-180"
                    )} />
                  </Button>

                  {state.isStorageAdvancedExpanded && (
                    <div className="pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Storage Size (GB)</Label>
                            <HelperTooltip text="Maximum storage allocated for system metadata and operations" />
                          </div>
                          <Input 
                            type="number" 
                            value={state.storageSize} 
                            onChange={(e) => updateState({ storageSize: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Retention (Days)</Label>
                            <HelperTooltip text="How long your data is kept before being automatically cleaned up" />
                          </div>
                          <div className="flex gap-2">
                            {[7, 30, 90].map((d) => (
                              <Button
                                key={d}
                                variant={state.dataRetention === d ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => updateState({ dataRetention: d })}
                              >
                                {d}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <div className="flex gap-4">
                          <Button
                            variant={state.backupFrequency === "daily" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => updateState({ backupFrequency: "daily" })}
                          >
                            Daily
                          </Button>
                          <Button
                            variant={state.backupFrequency === "weekly" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => updateState({ backupFrequency: "weekly" })}
                          >
                            Weekly
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
              onClick={() => router.push("/system-scaling")}
            >
              Finalize Hyperlake
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
