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
  Database,
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
  // Storage
  s3BucketName: string
  // Advanced
  serviceCidr: string
  // Networking Extended
  natGatewayId: string
  internetGatewayId: string
  publicRouteTableId: string
  privateRouteTableId: string
  s3VpcEndpointId: string
  s3BackupUserName: string
  hmacAccessKey: string
  hmacSecretKey: string
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
    az1: "us-east-1a",
    az2: "us-east-1b",
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
    s3BucketName: "",
    natGatewayId: "",
    internetGatewayId: "",
    publicRouteTableId: "",
    privateRouteTableId: "",
    s3VpcEndpointId: "",
    s3BackupUserName: "",
    hmacAccessKey: "",
    hmacSecretKey: "",
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
          region: cloudState.region || outputs.Region || prev.region,
          az1: cloudState.az1 || outputs.AvailabilityZone1 || prev.az1,
          az2: cloudState.az2 || outputs.AvailabilityZone2 || prev.az2,
          s3BucketName: cloudState.s3BucketName || prev.s3BucketName,
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
          natGatewayId: outputs.NatGatewayId || prev.natGatewayId,
          internetGatewayId: outputs.InternetGatewayId || prev.internetGatewayId,
          publicRouteTableId: outputs.PublicRouteTableId || prev.publicRouteTableId,
          privateRouteTableId: outputs.PrivateRouteTableId || prev.privateRouteTableId,
          s3VpcEndpointId: outputs.S3VPCEndpointId || prev.s3VpcEndpointId,
          s3BackupUserName: outputs.S3BackupUserName || prev.s3BackupUserName,
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
          <h1 className="text-3xl font-bold text-foreground">Your Cloud Environment</h1>
          <p className="mt-2 text-muted-foreground">
            Review your system details — these are automatically filled in for you.
          </p>
        </div>

        {/* System Summary */}
        <div className="space-y-6 mb-6">
          <Card className="border-emerald-100 shadow-sm bg-emerald-50/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Settings className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">System Summary</h2>
              </div>

              <div className="grid gap-4">
                {/* Cluster Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Identity</Label>
                  <div className="flex items-center gap-3">
                     <code className="px-3 py-1.5 bg-white rounded-lg text-sm font-mono border border-emerald-200 text-emerald-900">
                        {state.clusterName}
                     </code>
                     <ValidationBadge valid={true} label="Identified" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-emerald-100/50">
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.region} label="Location Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">Region: {state.region || "us-east-1"}</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={!!state.vpcId} label="Network Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">Private & Secure</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.permissions} label="Access Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">IAM Roles Verified</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.encryption} label="Data Protected" />
                    <p className="text-[10px] text-muted-foreground ml-6">KMS Encrypted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4 mb-8">
          {/* Network Foundation Section */}
          <SectionCard
            title="Network"
            icon={Network}
            badge="Read-only · Auto-filled"
            defaultOpen={true}
          >
            <div className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Your system will run inside the private network that was already set up for you. These values were imported from your cloud environment setup.
              </p>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-blue-900/60">Deployment Region</Label>
                      </div>
                      <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-blue-900 font-mono border border-blue-200/50">
                        {state.region || "us-east-1"}
                      </code>
                   </div>
                   <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Settings className="w-3.5 h-3.5 text-emerald-600" />
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-emerald-900/60">Availability Zones</Label>
                      </div>
                      <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-emerald-900 font-mono border border-emerald-200/50">
                        {[state.az1, state.az2].filter(Boolean).join(", ") || "us-east-1a, us-east-1b"}
                      </code>
                   </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">VPC (Virtual Private Cloud)</Label>
                    <p className="text-[10px] text-muted-foreground -mt-0.5">The main isolated container for all your cloud resources.</p>
                    <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                      {state.vpcId || "Pending..."}
                    </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">VPC CIDR Block</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">The range of internal addresses for your network.</p>
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
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Private Subnets</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">Secure sections of your network where your servers run.</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                    {state.subnetIds || "Pending..."}
                  </code>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Public Subnets</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">Sections of your network that can talk to the internet.</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                    {state.publicSubnetIds || "Pending..."}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Node Security Group</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">A virtual firewall that protects your individual servers.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.securityGroupIds || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cluster Security Group</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">A virtual firewall that protects the central system brain.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.clusterSecurityGroupId || "Pending..."}
                      </code>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">NAT Gateway</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Allows your secure servers to download updates safely.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.natGatewayId || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Internet Gateway</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">The main door for internet traffic to your public services.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.internetGatewayId || "Pending..."}
                      </code>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Public Route Table</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Rules that direct traffic for your public services.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.publicRouteTableId || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Private Route Table</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Rules that direct traffic for your secure servers.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.privateRouteTableId || "Pending..."}
                      </code>
                   </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">S3 VPC Endpoint</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">A private tunnel for secure, fast access to your storage.</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                    {state.s3VpcEndpointId || "Pending..."}
                  </code>
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

                 <div className="space-y-6">
                  {/* Deployment Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">System Orchestrator Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">The primary identity used to automate the creation and management of your cloud resources.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">IAM Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.orchestratorRoleArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Worker Node Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Compute Node Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions that allow your compute servers to run applications and securely access cloud services.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">IAM Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.nodeGroupRoleArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* System Management Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Infrastructure Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Provides the cluster with the necessary permissions to manage its associated cloud resources.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">IAM Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.clusterRoleArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Karpenter Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Auto-Scaling Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Allows the system to automatically adjust the number of servers based on your current workload.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">IAM Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.karpenterRoleArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Velero Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Storage Backup Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions used to safely create backups of your data and restore them during recovery.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">IAM Role ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.veleroRoleArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Encryption */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Lock className="w-4 h-4" />
                      <Label className="text-sm font-bold">Master Encryption Key</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">A master key used to encrypt and protect your system secrets and sensitive data at rest.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">KMS Key ARN</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.kmsKeyArn || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* S3 User */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Database className="w-4 h-4" />
                      <Label className="text-sm font-bold">Billing & Storage Identity</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">A dedicated secure identity used for pricing discovery and managing your datalake tables (Iceberg).</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">User Name</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.s3BackupUserName || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Storage Credentials */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Database className="w-4 h-4" />
                      <Label className="text-sm font-bold">Storage Access Keys</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">S3-compatible credentials used for managing your datalake and system logs.</p>
                    <div className="ml-6 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Access Key ID (HMAC)</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.hmacAccessKey || "Imported from setup"}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Secret Access Key (HMAC)</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.hmacSecretKey ? "••••••••••••••••" : "Imported from setup"}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

          {/* Storage Section */}
          <SectionCard
            title="Cloud Storage"
            icon={Database}
            badge="Auto-detected"
            defaultOpen={true}
          >
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Primary Data Bucket</Label>
                <p className="text-[10px] text-muted-foreground -mt-1.5">The bucket will be used to store datalake (Iceberg), logs, and backups.</p>
                <div className="ml-6 space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">S3 Bucket Name</Label>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                    {state.s3BucketName || "Not configured"}
                  </code>
                </div>
              </div>
            </div>
          </SectionCard>

        </div>



        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 h-16">
          <div className="max-w-2xl mx-auto px-4 h-full flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/aws/cloud-setup")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              size="lg"
              disabled={!allValid}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-10 px-8"
              onClick={() => router.push("/aws/compute-strategy")}
            >
              Continue to Compute Settings
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
