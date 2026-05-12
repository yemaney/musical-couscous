import { ClusterSetupWizard } from "@/components/cluster-setup-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function ClusterSetupPage() {
  return (
    <>
      <SetupStageProgress />
      <ClusterSetupWizard />
    </>
  )
}
