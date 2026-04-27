"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
  Globe,
  Settings,
  Lock,
  Network,
  DollarSign,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Generate a random cluster name
function generateClusterName() {
  const adjectives = ["swift", "bright", "calm", "deep", "bold"]
  const nouns = ["cloud", "stream", "peak", "wave", "spark"]
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNum = Math.floor(Math.random() * 1000)
  return `${randomAdj}-${randomNoun}-${randomNum}`
}

const GCP_REGIONS = [
  { value: "us-central1", label: "US Central (Iowa)", recommended: true },
  { value: "us-east1", label: "US East (S. Carolina)" },
  { value: "us-west1", label: "US West (Oregon)" },
  { value: "europe-west1", label: "Europe (Belgium)" },
  { value: "europe-west3", label: "Europe (Frankfurt)" },
  { value: "asia-southeast1", label: "Asia Pacific (Singapore)" },
]

interface ClusterState {
  clusterName: string
  region: string
  serviceAccount: string
  network: string
  subnet: string
  podRange: string
  serviceRange: string
  kubernetesVersion: string
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

function ValidationBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <CheckCircle2 className="w-4 h-4 text-blue-500" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={valid ? "text-blue-600" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-medium text-foreground">{title}</span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function GCPClusterSetupWizard() {
  const router = useRouter()
  const [previousSetupMode, setPreviousSetupMode] = useState<"recommended" | "advanced">("recommended")
  const [state, setState] = useState<ClusterState>({
    clusterName: "",
    region: "us-central1",
    serviceAccount: "",
    network: "",
    subnet: "",
    podRange: "10.4.0.0/14",
    serviceRange: "10.0.32.0/20",
    kubernetesVersion: "1.29",
  })

  useEffect(() => {
    const savedState = localStorage.getItem("gcpCloudSetupState")
    if (savedState) {
      try {
        const cloudState = JSON.parse(savedState)
        setPreviousSetupMode(cloudState.setupMode || "recommended")
        setState(prev => ({
          ...prev,
          network: cloudState.vpcName || prev.network,
          subnet: cloudState.subnetNames || prev.subnet,
        }))
      } catch (e) {
        console.error("Failed to load previous step data", e)
      }
    }
  }, [])

  useEffect(() => {
    if (!state.clusterName) {
      setState((prev) => ({ ...prev, clusterName: generateClusterName() }))
    }
  }, [state.clusterName])

  const updateState = (updates: Partial<ClusterState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("gcpClusterSetupState", JSON.stringify(next))
      return next
    })
  }

  const isRecommendedMode = previousSetupMode === "recommended"

  const validations = {
    clusterName: state.clusterName.length >= 3,
    region: !!state.region,
    permissions: true,
    encryption: true,
  }

  const allValid = Object.values(validations).every(Boolean)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">GKE Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure your Kubernetes engine foundations on GCP
          </p>
        </div>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Pre-filled with GCP defaults</p>
              <p className="text-sm text-blue-700 mt-1">We&apos;ve optimized these settings for standard data workloads. You can modify them in Advanced Mode if needed.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-lg">Basic Setup</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="region">Region</Label>
                    <HelperTooltip text="The GCP region for your GKE cluster" />
                  </div>
                  <Select value={state.region} onValueChange={(value) => updateState({ region: value })}>
                    <SelectTrigger id="region" className="w-full">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {GCP_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          <div className="flex items-center gap-2">
                            <span>{region.label}</span>
                            {region.recommended && <span className="text-xs text-blue-600 font-medium">Recommended</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="clusterName">Cluster Name</Label>
                    <HelperTooltip text="Unique identifier for your GKE cluster" />
                  </div>
                  <Input id="clusterName" value={state.clusterName} readOnly className="bg-muted/50 font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mb-8">
          <SectionCard title="Security & IAM" icon={Shield} badge="Auto-managed" defaultOpen={false}>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Dedicated service accounts will be created for cluster management.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-muted-foreground">Workload Identity</Label>
                   <div className="flex items-center gap-2 text-sm text-blue-600">
                     <CheckCircle2 className="w-4 h-4" />
                     <span>Enabled by default</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-muted-foreground">Node Service Account</Label>
                   <div className="flex items-center gap-2 text-sm text-blue-600">
                     <CheckCircle2 className="w-4 h-4" />
                     <span>Provisioned automatically</span>
                   </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {!isRecommendedMode && (
            <SectionCard title="Networking (VPC)" icon={Network} badge="Advanced" defaultOpen={false}>
              <div className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>VPC Network</Label>
                    <Input value={state.network} onChange={(e) => updateState({ network: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Subnet</Label>
                    <Input value={state.subnet} onChange={(e) => updateState({ subnet: e.target.value })} />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Advanced Settings" icon={Settings} defaultOpen={false}>
            <div className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Kubernetes Version</Label>
                  <Select value={state.kubernetesVersion} onValueChange={(v) => updateState({ kubernetesVersion: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.29">1.29 (Rapid)</SelectItem>
                      <SelectItem value="1.28">1.28 (Regular)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4 flex flex-wrap gap-4">
            <ValidationBadge valid={validations.clusterName} label="Name generated" />
            <ValidationBadge valid={validations.region} label="Region set" />
            <ValidationBadge valid={validations.permissions} label="IAM ready" />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button
            size="lg"
            disabled={!allValid}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/gcp/compute-strategy")}
          >
            Continue to Compute Strategy
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
