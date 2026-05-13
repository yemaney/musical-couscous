"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Cloud,
  Settings,
  Network,
  Database,
  FileText,
  Upload,
  CheckCircle2,
  Copy,
  Download,
  ChevronRight,
  ChevronLeft,
  Loader2,
  HelpCircle,
  Shield,
  DollarSign,
  UserPlus,
  KeyRound,
  Globe,
  Info,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SetupMode = "recommended" | "advanced"
type S3UserOption = "create" | "existing"

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

interface WizardState {
  setupMode: SetupMode
  // Network fields
  region: string
  az1: string
  az2: string
  vpcId: string
  subnetIds: string
  publicSubnetIds: string
  clusterSecurityGroupId: string
  nodeSecurityGroupId: string
  networkCidr: string
  serviceCidr: string
  useOwnVpc: boolean
  // Storage fields
  s3UserOption: S3UserOption
  s3BucketName: string
  accessKeyId: string
  secretAccessKey: string
  createS3User: boolean
  // Identity
  projectId: string
  subdomain: string
  // Progress tracking
  outputsUploaded: boolean
  provisioningOutputs: Record<string, string>
}

const initialState: WizardState = {
  setupMode: "recommended",
  region: "us-east-1",
  az1: "us-east-1a",
  az2: "us-east-1b",
  vpcId: "",
  subnetIds: "",
  publicSubnetIds: "",
  clusterSecurityGroupId: "",
  nodeSecurityGroupId: "",
  networkCidr: "10.0.0.0/16",
  serviceCidr: "172.20.0.0/16",
  useOwnVpc: false,
  s3UserOption: "create",
  s3BucketName: "",
  accessKeyId: "",
  secretAccessKey: "",
  createS3User: true,
  projectId: "",
  subdomain: "",
  outputsUploaded: false,
  provisioningOutputs: {},
}

const STEPS = [
  { id: 0, title: "Welcome", icon: Cloud },
  { id: 2, title: "Network", icon: Network },
  { id: 3, title: "Storage", icon: Database },
  { id: 5, title: "Review", icon: FileText },
  { id: 9, title: "Complete", icon: CheckCircle2 },
]

function OptionCard({
  selected,
  onClick,
  recommended,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  recommended?: boolean
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200",
        "hover:border-emerald-500/50 hover:bg-emerald-50/50",
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
          : "border-border bg-card"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-4 px-3 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full">
          Recommended
        </span>
      )}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg",
            selected ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            selected ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
          )}
        >
          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  )
}

function CommandBlock({ command, onCopy }: { command: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto font-mono w-full">
        {command}
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
      </Button>
    </div>
  )
}

function HelperTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function CloudSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [state, setState] = useState<WizardState>(initialState)
  const [isUploading, setIsUploading] = useState(false)

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates }

      // Auto-update AZs when region changes if they are still at defaults
      if (updates.region && (!updates.az1 || !updates.az2)) {
        newState.az1 = `${updates.region}a`
        newState.az2 = `${updates.region}b`
      }

      localStorage.setItem("cloudSetupState", JSON.stringify(newState))
      return newState
    })
  }, [])

  const getVisibleSteps = useCallback(() => {
    return STEPS
  }, [])

  const visibleSteps = getVisibleSteps()

  const getCurrentStepIndex = () => {
    return visibleSteps.findIndex((step) => step.id === currentStep)
  }

  const goNext = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < visibleSteps.length - 1) {
      setCurrentStep(visibleSteps[currentIndex + 1].id)
    } else {
      // Last step of the flow, go to success screen
      setCurrentStep(9)
    }
  }

  const goBack = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(visibleSteps[currentIndex - 1].id)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const json = JSON.parse(content)

          const outputs: Record<string, string> = {}
          const updates: Partial<WizardState> = { outputsUploaded: true }

          // Auto-map key fields for convenience
          if (json.ProjectId) updates.projectId = json.ProjectId
          if (json.Subdomain) updates.subdomain = json.Subdomain

          if (Array.isArray(json)) {
            json.forEach((item: any) => {
              if (item.OutputKey && item.OutputValue) {
                outputs[item.OutputKey] = item.OutputValue

                // Auto-map key fields from CF Outputs
                if (item.OutputKey === "VpcId") updates.vpcId = item.OutputValue
                if (item.OutputKey === "ProjectId") updates.projectId = item.OutputValue
                if (item.OutputKey === "Subdomain") updates.subdomain = item.OutputValue
                if (item.OutputKey === "VpcCidrBlock") updates.networkCidr = item.OutputValue
                if (item.OutputKey === "NodeSecurityGroupId") updates.nodeSecurityGroupId = item.OutputValue
                if (item.OutputKey === "PrivateSubnetIds") {
                  try {
                    // Parse if it's a stringified JSON array
                    const subnets = JSON.parse(item.OutputValue)
                    if (Array.isArray(subnets)) {
                      updates.subnetIds = subnets.join(", ")
                    } else {
                      updates.subnetIds = item.OutputValue
                    }
                  } catch (e) {
                    updates.subnetIds = item.OutputValue
                  }
                }
              }
            })
          }

          // If we are in advanced mode (existing network),
          // ensure the network details from the UI are included in the outputs
          // if they weren't provided by the CloudFormation stack.
          if (state.setupMode === "advanced") {
            if (!outputs.VpcId) outputs.VpcId = state.vpcId
            if (!outputs.VpcCidrBlock) outputs.VpcCidrBlock = state.networkCidr
            if (!outputs.PrivateSubnetIds) outputs.PrivateSubnetIds = JSON.stringify((state.subnetIds || "").split(",").map(s => s.trim()))
            if (!outputs.PublicSubnetIds) outputs.PublicSubnetIds = JSON.stringify((state.publicSubnetIds || "").split(",").map(s => s.trim()))
          }

          updates.provisioningOutputs = outputs

          // Simulate Lambda Verification (k8token)
          // In a real app, this would be an API call to invoke the lambda
          console.log("Invoking k8token lambda with outputs...", outputs)
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Success! Update state
          updateState(updates)
        } catch (err) {
          console.error("Failed to parse outputs file:", err)
          alert("Invalid JSON file format. Please upload a valid CloudFormation outputs file.")
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsText(file)
    }
  }

  const generateCommand = () => {
    const params: string[] = []

    // Required Identity
    params.push(`Subdomain=${state.subdomain || "<subdomain>"}`)
    params.push(`ProjectId=${state.projectId || "<project-id>"}`)

    // Network parameters
    if (state.setupMode === "recommended") {
      params.push("CreateNetwork=true")
    } else {
      // Advanced mode
      if (state.useOwnVpc) {
        params.push("CreateNetwork=false")
        // Note: aws-setup.yaml logic for existing VPC might need VpcId parameter addition if supported
      } else {
        params.push("CreateNetwork=true")
      }
      
      if (state.networkCidr) {
        params.push(`VpcCidr=${state.networkCidr}`)
      }
    }

    // Common Network Parameters
    params.push(`AvailabilityZone1=${state.az1 || (state.region + "a")}`)
    params.push(`AvailabilityZone2=${state.az2 || (state.region + "b")}`)

    // Storage parameters
    if (state.s3BucketName) {
      params.push(`S3BucketName=${state.s3BucketName}`)
    }

    return `aws cloudformation deploy \\
  --template-file aws-setup.yaml \\
  --stack-name cloud-setup-stack \\
  --region ${state.region || "us-east-1"} \\
  --capabilities CAPABILITY_NAMED_IAM \\
  --parameter-overrides \\
    ${params.join(" \\\n    ")}`
  }

  const createAccessKeyCommand = `aws iam create-access-key --user-name cerebrixos-backup-user-${state.projectId || "<project-id>"}`

  const enableServicesCommand = `aws iam create-service-linked-role --aws-service-name spot.amazonaws.com 2>/dev/null || true
aws iam create-service-linked-role --aws-service-name eks.amazonaws.com 2>/dev/null || true
aws iam create-service-linked-role --aws-service-name eks-nodegroup.amazonaws.com 2>/dev/null || true`

  const getOutputsCommand = `aws cloudformation describe-stacks \\
  --stack-name cloud-setup-stack \\
  --query "Stacks[0].Outputs" > outputs.json`

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Let&apos;s set up your cloud
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                This takes approximately 5 minutes
              </p>
            </div>
            <div className="max-w-2xl mx-auto pt-4">
              <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 text-left">
                    <div className="p-2 bg-slate-200/50 rounded-lg shrink-0">
                      <Settings className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">CLI Prerequisites</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Before you can deploy, ensure your local environment is ready. You will run commands in the final step to provision your cloud.
                        </p>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold">AWS CLI</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Installed and configured with <code className="text-blue-600">aws configure</code></p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold">Permissions</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Admin access to create IAM roles and VPC networks</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-2xl mx-auto">
              <OptionCard
                selected={state.setupMode === "recommended"}
                onClick={() => updateState({ setupMode: "recommended" })}
                recommended
                icon={CheckCircle2}
                title="Simple"
                description="Automatically create a new private network for you."
              />
              <OptionCard
                selected={state.setupMode === "advanced"}
                onClick={() => updateState({ setupMode: "advanced" })}
                icon={Settings}
                title="Advanced"
                description="Use your own existing private network."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                <Network className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Network Configuration</h2>
              <p className="mt-2 text-muted-foreground">Select your deployment region and network parameters</p>
            </div>

            <div className="grid gap-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                {/* Common Fields: Region & Zones */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">AWS Region</Label>
                    <Select
                      value={state.region}
                      onValueChange={(value) => updateState({ region: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {AWS_REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zone 1</Label>
                    <Input
                      value={state.az1}
                      onChange={(e) => updateState({ az1: e.target.value })}
                      placeholder={`${state.region}a`}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zone 2</Label>
                    <Input
                      value={state.az2}
                      onChange={(e) => updateState({ az2: e.target.value })}
                      placeholder={`${state.region}b`}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {state.setupMode === "advanced" && (
                  <div className="pt-8 border-t space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-bold">Use my own VPC</Label>
                          <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">Bring-Your-Own</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Connect to your existing infrastructure instead of creating new resources.</p>
                      </div>
                      <Switch
                        checked={state.useOwnVpc}
                        onCheckedChange={(checked) => updateState({ useOwnVpc: checked })}
                      />
                    </div>

                    {state.useOwnVpc && (
                      <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                        {/* VPC ID */}
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">VPC ID</Label>
                          <Input
                            placeholder="vpc-xxxxxxxxx"
                            value={state.vpcId}
                            onChange={(e) => updateState({ vpcId: e.target.value })}
                            className="h-12 rounded-xl"
                          />
                        </div>

                        {/* Security Groups */}
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cluster Security Group ID</Label>
                            <Input
                              placeholder="sg-xxxxxxxxx"
                              value={state.clusterSecurityGroupId}
                              onChange={(e) => updateState({ clusterSecurityGroupId: e.target.value })}
                              className="h-12 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Node Security Group ID</Label>
                            <Input
                              placeholder="sg-yyyyyyyyy"
                              value={state.nodeSecurityGroupId}
                              onChange={(e) => updateState({ nodeSecurityGroupId: e.target.value })}
                              className="h-12 rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Subnets */}
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Private Subnet IDs</Label>
                            <Input
                              placeholder="subnet-xxx, subnet-yyy"
                              value={state.subnetIds}
                              onChange={(e) => updateState({ subnetIds: e.target.value })}
                              className="h-12 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Public Subnet IDs</Label>
                            <Input
                              placeholder="subnet-aaa, subnet-bbb"
                              value={state.publicSubnetIds}
                              onChange={(e) => updateState({ publicSubnetIds: e.target.value })}
                              className="h-12 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CIDR Configuration (Always shown in Advanced) */}
                    <div className="grid sm:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300 border-t pt-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">VPC CIDR</Label>
                        <Input
                          placeholder="10.0.0.0/16"
                          value={state.networkCidr}
                          onChange={(e) => updateState({ networkCidr: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">EKS Service CIDR</Label>
                        <Input
                          placeholder="172.20.0.0/16"
                          value={state.serviceCidr}
                          onChange={(e) => updateState({ serviceCidr: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-600 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Storage Configuration</h2>
              <p className="mt-2 text-muted-foreground">Configure your S3 bucket and access credentials</p>
            </div>

            <div className="space-y-8 max-w-xl mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">S3 Bucket Name</Label>
                  <Input
                    placeholder="my-infrastructure-backups"
                    value={state.s3BucketName}
                    onChange={(e) => updateState({ s3BucketName: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Review and Deploy</h2>
              <p className="mt-2 text-muted-foreground">Follow these steps to complete your setup</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="bg-muted/30 border-none shadow-none mb-8 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500 text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 leading-tight">What will be created?</h3>
                      <p className="text-xs text-emerald-700/70">A summary of the resources being provisioned</p>
                    </div>
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Security & Access</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            A dedicated encryption key (KMS) and identity roles will be created. Managed keys typically incur a small monthly fee and usage costs.
                          </p>
                        </div>
                      </div>
                      {state.s3BucketName && (
                        <div className="flex gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Storage Connection</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Secure access keys to connect your <span className="font-mono">{state.s3BucketName}</span> bucket to the cluster.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {!state.useOwnVpc && (
                        <div className="flex gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Private Network</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              A new, isolated virtual network (VPC) with a NAT Gateway and Internet Gateway. These resources provide secure connectivity and may incur standard cloud provider costs.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <h3 className="font-semibold text-foreground text-lg mb-6">Follow these steps</h3>

              <div className="space-y-6">
                {/* Step 1: Download */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Download the setup file</p>
                    <p className="text-sm text-muted-foreground">
                      Save this file as <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">aws-setup.yaml</code> in a folder you can access from your terminal.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download aws-setup.yaml
                    </Button>
                  </div>
                </div>

                {/* Step 2: Enable Services */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Enable cloud services</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure your account has the required service-linked roles. Run this command:
                    </p>
                    <CommandBlock command={enableServicesCommand} onCopy={() => {}} />
                  </div>
                </div>

                {/* Step 3: Run deploy command */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Run the setup command</p>
                    <p className="text-sm text-muted-foreground">
                      Open your terminal, navigate to the folder where you saved the file, and run this command:
                    </p>
                    <CommandBlock command={generateCommand()} onCopy={() => {}} />
                  </div>
                </div>

                {/* Step 4: Get outputs */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Save the results</p>
                    <p className="text-sm text-muted-foreground">
                      After the setup finishes, run this command to save the results to a file called <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">outputs.json</code>:
                    </p>
                    <CommandBlock command={getOutputsCommand} onCopy={() => { }} />
                  </div>
                </div>

                {/* Step 5: Upload */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    5
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Upload the results file</p>
                      <HelperTooltip text="File must be a JSON array of objects with 'OutputKey' and 'OutputValue' fields." />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload the <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">outputs.json</code> file to verify:
                    </p>
                    <label
                      htmlFor="file-upload"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                        state.outputsUploaded
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-500 hover:bg-emerald-50/50"
                      )}
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      ) : state.outputsUploaded ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-emerald-600">Verification Complete</p>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium text-foreground">Click to upload outputs.json</p>
                        </div>
                      )}
                      <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileUpload} disabled={isUploading || state.outputsUploaded} />
                    </label>
                  </div>
                </div>

                {/* Step 6: Access Keys (Conditional) */}
                {state.s3BucketName && (
                  <div className="flex items-start gap-4 pt-6 border-t border-dashed">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                      6
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm font-medium">Generate and save access keys</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Since you are using storage backups, you need to generate access keys for the new IAM user. Run this command in your terminal:
                        </p>
                      </div>
                      <CommandBlock command={createAccessKeyCommand} onCopy={() => { }} />
                      <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key ID</Label>
                          <Input
                            placeholder="AKIA..."
                            value={state.accessKeyId}
                            onChange={(e) => updateState({ accessKeyId: e.target.value })}
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secret Access Key</Label>
                          <Input
                            type="password"
                            placeholder="••••••••••••"
                            value={state.secretAccessKey}
                            onChange={(e) => updateState({ secretAccessKey: e.target.value })}
                            className="h-10 bg-background"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5">
                        <Shield className="w-3 h-3" /> These keys are required to connect your cluster to S3.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-8 text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">🎉 Your cloud is ready!</h2>
              <p className="mt-3 text-lg text-muted-foreground">Everything has been configured successfully</p>
            </div>

            <Button
              size="lg"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-14 px-8 rounded-2xl shadow-xl shadow-emerald-500/20"
              onClick={() => {
                localStorage.setItem("cloudSetupState", JSON.stringify(state))
                router.push("/aws/cluster-setup")
              }}
            >
              Continue to System Review
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return true
      case 2:
        if (state.setupMode === "recommended") return !!state.region
        if (state.useOwnVpc) {
          return !!(
            state.region &&
            state.vpcId &&
            state.subnetIds &&
            state.publicSubnetIds &&
            state.clusterSecurityGroupId &&
            state.nodeSecurityGroupId
          )
        }
        return !!(state.region && state.networkCidr)
      case 3:
        return state.s3BucketName.trim() !== ""
      case 5:
        const baseRequirement = state.outputsUploaded
        if (state.s3BucketName) {
          return baseRequirement && !!state.accessKeyId && !!state.secretAccessKey
        }
        return baseRequirement
      default:
        return true
    }
  }

  const currentStepIndex = getCurrentStepIndex()
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Vertical Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                  Wizard Progress
                </h3>
                <nav className="space-y-0">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === currentStepIndex
                    const isComplete = index < currentStepIndex
                    return (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => isComplete && setCurrentStep(step.id)}
                            disabled={!isComplete}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all relative z-10",
                              isActive
                                ? "bg-white border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20"
                                : isComplete
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-muted border-transparent text-muted-foreground/30"
                            )}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </button>
                          {index < STEPS.length - 1 && (
                            <div className={cn("w-0.5 h-10 -my-1 rounded relative z-0", isComplete ? "bg-emerald-500" : "bg-muted")} />
                          )}
                        </div>
                        <div className="pt-1.5 flex-1">
                          <div className={cn("text-sm font-bold transition-colors", isActive ? "text-emerald-600" : isComplete ? "text-foreground" : "text-muted-foreground/30")}>
                            {step.title}
                          </div>
                          {isActive && (
                            <div className="text-[10px] text-emerald-500/70 font-medium uppercase tracking-wider animate-in fade-in slide-in-from-left-1">
                              In Progress
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>
              
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 pb-32">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {renderStepContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Navigation */}
      {currentStep !== 9 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="hidden md:block w-64" /> {/* Spacer to align with content */}
            <div className="flex-1 flex items-center justify-between md:pl-12">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={currentStepIndex === 0}
                className="gap-2 h-12 px-6 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={goNext}
                disabled={!canGoNext()}
                className="gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

