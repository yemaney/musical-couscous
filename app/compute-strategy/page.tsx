import { ComputeStrategyWizard } from "@/components/compute-strategy-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function ComputeStrategyPage() {
  return (
    <>
      <SetupStageProgress />
      <ComputeStrategyWizard />
    </>
  )
}
