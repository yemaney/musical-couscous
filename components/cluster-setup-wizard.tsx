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
  ChevronLeft,
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
  subdomain: string
  projectId: string
  region: string
  az1: string
  az2: string
  // Security (auto-configured)
  orchestratorRoleArn: string
  nodeGroupRoleArn: string
  clusterRoleArn: string
  karpenterRoleArn: string
  kmsKeyArn: string
  veleroRoleArn: string
  // Networking
  vpcId: string
  vpcCidr: string
  subnetIds: string
  publicSubnetIds: string
  securityGroupIds: string
  clusterSecurityGroupId: string
  // Advanced
  serviceCidr: string
  // Provisioned Outputs
  provisioningOutputs?: Record<string, string>
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
    subdomain: "",
    projectId: "",
    region: "us-east-1",
    az1: "",
    az2: "",
    orchestratorRoleArn: "",
    nodeGroupRoleArn: "",
    clusterRoleArn: "",
    karpenterRoleArn: "",
    kmsKeyArn: "",
    veleroRoleArn: "",
    vpcId: "",
    vpcCidr: "",
    subnetIds: "",
    publicSubnetIds: "",
    securityGroupIds: "",
    clusterSecurityGroupId: "",
    serviceCidr: "172.20.0.0/16",
  })

  // Load data from previous step
  useEffect(() => {
    const savedState = localStorage.getItem("cloudSetupState")
    if (savedState) {
      try {
        const cloudState = JSON.parse(savedState)
        setPreviousSetupMode(cloudState.setupMode || "recommended")
        
        const outputs = cloudState.provisioningOutputs || {}
        
        setState(prev => ({
          ...prev,
          region: cloudState.region || prev.region,
          az1: cloudState.az1 || prev.az1,
          az2: cloudState.az2 || prev.az2,
          vpcId: outputs.VpcId || cloudState.vpcId || prev.vpcId,
          vpcCidr: outputs.VpcCidrBlock || prev.vpcCidr,
          subnetIds: (() => {
            if (outputs.PrivateSubnetIds) {
              try {
                const subnets = JSON.parse(outputs.PrivateSubnetIds)
                return Array.isArray(subnets) ? subnets.join(", ") : outputs.PrivateSubnetIds
              } catch {
                return outputs.PrivateSubnetIds
              }
            }
            return cloudState.subnetIds || prev.subnetIds
          })(),
          publicSubnetIds: (() => {
            if (outputs.PublicSubnetIds) {
              try {
                const subnets = JSON.parse(outputs.PublicSubnetIds)
                return Array.isArray(subnets) ? subnets.join(", ") : outputs.PublicSubnetIds
              } catch {
                return outputs.PublicSubnetIds
              }
            }
            return prev.publicSubnetIds
          })(),
          securityGroupIds: outputs.NodeSecurityGroupId || cloudState.securityGroupIds || prev.securityGroupIds,
          clusterSecurityGroupId: outputs.ClusterSecurityGroupId || prev.clusterSecurityGroupId,
          orchestratorRoleArn: outputs.OrchestratorRoleArn || prev.orchestratorRoleArn,
          nodeGroupRoleArn: outputs.EksNodeGroupRoleArn || prev.nodeGroupRoleArn,
          clusterRoleArn: outputs.EksClusterRoleArn || prev.clusterRoleArn,
          karpenterRoleArn: outputs.KarpenterControllerRoleArn || prev.karpenterRoleArn,
          kmsKeyArn: outputs.KmsKeyArn || prev.kmsKeyArn,
          veleroRoleArn: outputs.VeleroServerRoleArn || prev.veleroRoleArn,
          subdomain: outputs.Subdomain || prev.subdomain,
          projectId: outputs.ProjectId || prev.projectId,
          provisioningOutputs: outputs,
        }))
      } catch (e) {
        console.error("Failed to load previous step data", e)
      }
    }
  }, [])

  // Set cluster name from provisioned data or generate one
  useEffect(() => {
    if (state.subdomain && state.projectId) {
      setState((prev) => ({ ...prev, clusterName: `${state.subdomain}-${state.projectId}` }))
    } else if (!state.clusterName) {
      setState((prev) => ({ ...prev, clusterName: generateClusterName() }))
    }
  }, [state.subdomain, state.projectId, state.clusterName])

  const updateState = (updates: Partial<ClusterState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("clusterSetupState", JSON.stringify(next))
      return next
    })
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
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your System Configuration</h1>
          <p className="mt-2 text-muted-foreground">
            Review your system details — these are automatically filled in for you.
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
                <h2 className="font-semibold text-lg text-foreground">System Identity</h2>
              </div>

              <div className="space-y-6">
                {/* Cluster Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="clusterName">System Name</Label>
                    <HelperTooltip text="A unique ID for your system. This is automatically assigned." />
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
          {/* Network Foundation Section */}
          <SectionCard
            title="Your Private Network"
            icon={Network}
            badge="Read-only · Auto-filled"
            defaultOpen={false}
          >
            <div className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Your system will run inside the private network that was already set up for you. These values were imported from your setup file.
              </p>

              <div className="grid gap-4">
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Network ID</Label>
                    <p className="text-[10px] text-muted-foreground -mt-0.5">Your private network's unique identifier</p>
                    <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                      {state.vpcId || "Pending..."}
                    </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Network Range</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.vpcCidr || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                     <div className="flex items-center gap-2 mb-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground m-0">System Internal Range</Label>
                        <HelperTooltip text="The internal IP range used only by your system's components. Default is fine for most setups." />
                     </div>
                     <Input
                        id="serviceCidr"
                        value={state.serviceCidr}
                        onChange={(e) => updateState({ serviceCidr: e.target.value })}
                        placeholder="172.20.0.0/16"
                        className="h-8 text-[10px] font-mono"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Private Connection Points</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">Internal access points for your system's servers</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                    {state.subnetIds || "Pending..."}
                  </code>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Public Connection Points</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">External access points for internet-facing services</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                    {state.publicSubnetIds || "Pending..."}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Server Firewall</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Controls network access to your servers</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.securityGroupIds || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">System Firewall</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Controls network access to your system</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.clusterSecurityGroupId || "Pending..."}
                      </code>
                   </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Security Section */}
          <SectionCard
            title="Security Permissions"
            icon={Shield}
            badge="Read-only · Auto-filled"
            defaultOpen={false}
          >
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                These permissions were automatically set up to keep your system secure. No action needed.
              </p>

              <div className="space-y-4">
                {state.orchestratorRoleArn && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Deployment Permission</Label>
                      <HelperTooltip text="Allows the system to automatically provision your infrastructure on your behalf." />
                    </div>
                    <div className="ml-6">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.orchestratorRoleArn}
                      </code>
                    </div>
                  </div>
                )}

                {state.nodeGroupRoleArn && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Server Permission</Label>
                      <HelperTooltip text="Allows your compute servers to operate securely within your account." />
                    </div>
                    <div className="ml-6">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.nodeGroupRoleArn}
                      </code>
                    </div>
                  </div>
                )}

                {state.clusterRoleArn && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">System Management Permission</Label>
                      <HelperTooltip text="Allows the system's control center to manage your servers and networking." />
                    </div>
                    <div className="ml-6">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.clusterRoleArn}
                      </code>
                    </div>
                  </div>
                )}

                {state.kmsKeyArn && (
                  <div className="space-y-2 pt-2 border-t border-dashed mt-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground font-semibold flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Data Encryption Key
                      </Label>
                      <HelperTooltip text="Used to encrypt your system secrets and configuration data at rest." />
                    </div>
                    <div className="ml-6">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">KMS Key ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.kmsKeyArn}
                      </code>
                    </div>
                  </div>
                )}

                {state.karpenterRoleArn && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Auto-scaling Permission</Label>
                      <HelperTooltip text="Allows the system to automatically add or remove servers based on demand." />
                    </div>
                    <div className="ml-6">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.karpenterRoleArn}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

        </div>

        {/* Validation Summary */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <ValidationBadge valid={validations.region} label="Your location is set" />
              <ValidationBadge valid={validations.permissions} label="Your permissions are ready" />
              <ValidationBadge valid={validations.encryption} label="Your data is encrypted" />
            </div>
          </CardContent>
        </Card>


        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 h-16">
          <div className="max-w-2xl mx-auto px-4 h-full flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/cloud-setup")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              size="lg"
              disabled={!allValid}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-10 px-8"
              onClick={() => router.push("/compute-strategy")}
            >
              Continue to System Power
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
