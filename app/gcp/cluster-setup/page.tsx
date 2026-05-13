import { GCPClusterSetupWizard } from "@/components/gcp-cluster-setup-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function GCPClusterSetupPage() {
  return (
    <>
      <SetupStageProgress />
      <GCPClusterSetupWizard />
    </>
  )
}
