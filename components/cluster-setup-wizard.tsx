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

const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)", recommended: true },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
]

interface ClusterState {
  // Basic
  clusterName: string
  region: string
  // Security (auto-configured)
  orchestratorRoleArn: string
  nodeGroupRoleArn: string
  kmsKeyArn: string
  // Networking
  vpcId: string
  subnetIds: string
  securityGroupIds: string
  // Advanced
  serviceCidr: string
  kubernetesVersion: string
}

// We will load this from localStorage in the component

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
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={valid ? "text-emerald-600" : "text-muted-foreground"}>
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
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
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

export function ClusterSetupWizard() {
  const router = useRouter()
  const [previousSetupMode, setPreviousSetupMode] = useState<"recommended" | "advanced">("recommended")
  const [state, setState] = useState<ClusterState>({
    clusterName: "",
    region: "us-east-1",
    orchestratorRoleArn: "",
    nodeGroupRoleArn: "",
    kmsKeyArn: "",
    vpcId: "",
    subnetIds: "",
    securityGroupIds: "",
    serviceCidr: "172.20.0.0/16",
    kubernetesVersion: "1.29",
  })

  // Load data from previous step
  useEffect(() => {
    const savedState = localStorage.getItem("cloudSetupState")
    if (savedState) {
      try {
        const cloudState = JSON.parse(savedState)
        setPreviousSetupMode(cloudState.setupMode || "recommended")
        setState(prev => ({
          ...prev,
          vpcId: cloudState.vpcId || prev.vpcId,
          subnetIds: cloudState.subnetIds || prev.subnetIds,
          securityGroupIds: cloudState.securityGroupIds || prev.securityGroupIds,
        }))
      } catch (e) {
        console.error("Failed to load previous step data", e)
      }
    }
  }, [])

  // Auto-generate cluster name on mount
  useEffect(() => {
    if (!state.clusterName) {
      setState((prev) => ({ ...prev, clusterName: generateClusterName() }))
    }
  }, [state.clusterName])

  const updateState = (updates: Partial<ClusterState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const isRecommendedMode = previousSetupMode === "recommended"

  // Validation checks
  const validations = {
    clusterName: state.clusterName.length >= 3,
    region: !!state.region,
    permissions: true, // Auto-configured
    encryption: true, // Auto-configured
  }

  const allValid = Object.values(validations).every(Boolean)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">AWS Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure your cluster foundation and security
          </p>
        </div>

        {/* Reassurance message */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Most users don&apos;t need to change anything here
              </p>
              <p className="text-sm text-blue-700 mt-1">
                We&apos;ve pre-filled everything with secure, recommended defaults. You can continue without making any changes.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Setup - Always visible */}
        <div className="space-y-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Globe className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">Basic Setup</h2>
              </div>

              <div className="space-y-6">
                {/* Region */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="region">Region</Label>
                    <HelperTooltip text="The AWS region where your cluster will be created" />
                  </div>
                  <Select
                    value={state.region}
                    onValueChange={(value) => updateState({ region: value })}
                  >
                    <SelectTrigger id="region" className="w-full">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {AWS_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          <div className="flex items-center gap-2">
                            <span>{region.label}</span>
                            {region.recommended && (
                              <span className="text-xs text-emerald-600 font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cluster Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="clusterName">Cluster Name</Label>
                    <HelperTooltip text="A unique name for your cluster" />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="clusterName"
                      value={state.clusterName}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This unique identifier is automatically assigned to your project.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4 mb-8">
          {/* Security Section */}
          <SectionCard
            title="Security"
            icon={Shield}
            badge="Auto-configured"
            defaultOpen={false}
          >
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                These settings are automatically configured to keep your cluster secure.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Deployment Permissions</Label>
                    <HelperTooltip text="This allows us to securely create your infrastructure" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Configured automatically</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    We secure your deployment using an orchestrator role with strictly bounded permissions.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Data Encryption</Label>
                    <HelperTooltip text="Your data is encrypted at rest using AWS KMS" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enabled by default</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Networking Section - Only show if Advanced mode */}
          {!isRecommendedMode && (
            <SectionCard
              title="Networking"
              icon={Network}
              badge="From previous step"
              defaultOpen={false}
            >
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Using the network settings you provided earlier.
                </p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">VPC</Label>
                    <Input
                      value={state.vpcId}
                      onChange={(e) => updateState({ vpcId: e.target.value })}
                      placeholder="vpc-xxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Subnets</Label>
                    <Input
                      value={state.subnetIds}
                      onChange={(e) => updateState({ subnetIds: e.target.value })}
                      placeholder="subnet-xxx, subnet-yyy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Security Groups</Label>
                    <Input
                      value={state.securityGroupIds}
                      onChange={(e) => updateState({ securityGroupIds: e.target.value })}
                      placeholder="sg-xxx, sg-yyy"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Advanced Section */}
          <SectionCard title="Advanced Settings" icon={Settings} defaultOpen={false}>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                These settings are for advanced users. Most users can leave these as-is.
              </p>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="serviceCidr">Internal Network Range (advanced)</Label>
                    <HelperTooltip text="IP address range for Kubernetes services" />
                  </div>
                  <Input
                    id="serviceCidr"
                    value={state.serviceCidr}
                    onChange={(e) => updateState({ serviceCidr: e.target.value })}
                    placeholder="172.20.0.0/16"
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: 172.20.0.0/16
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="k8sVersion">Kubernetes Version</Label>
                    <HelperTooltip text="The version of Kubernetes to run" />
                  </div>
                  <Select
                    value={state.kubernetesVersion}
                    onValueChange={(value) => updateState({ kubernetesVersion: value })}
                  >
                    <SelectTrigger id="k8sVersion">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.29">
                        <div className="flex items-center gap-2">
                          <span>1.29</span>
                          <span className="text-xs text-emerald-600 font-medium">
                            Recommended
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="1.28">1.28</SelectItem>
                      <SelectItem value="1.27">1.27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Validation Summary */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <ValidationBadge valid={validations.clusterName} label="Cluster name set" />
              <ValidationBadge valid={validations.region} label="Region selected" />
              <ValidationBadge valid={validations.permissions} label="Permissions ready" />
              <ValidationBadge valid={validations.encryption} label="Encryption enabled" />
            </div>
          </CardContent>
        </Card>

        {/* Cost Estimate */}
        <div className="mb-8 p-4 bg-muted/50 border rounded-xl">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Cost</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kubernetes control plane (~$72/month)
                <br />
                Compute resources (based on usage)
              </p>
              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                This is a baseline estimate. Spot instances can reduce compute costs by up to 90%.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button
            size="lg"
            disabled={!allValid}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push("/compute-strategy")}
          >
            Continue to Compute Strategy
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
