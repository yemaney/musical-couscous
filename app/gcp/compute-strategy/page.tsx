import { GCPComputeStrategyWizard } from "@/components/gcp-compute-strategy-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function GCPComputeStrategyPage() {
  return (
    <>
      <SetupStageProgress />
      <GCPComputeStrategyWizard />
    </>
  )
}
