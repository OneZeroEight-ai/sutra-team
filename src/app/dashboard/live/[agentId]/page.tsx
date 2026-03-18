import { LiveDashboard } from '@/components/live/LiveDashboard'

export default async function LivePage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  return <LiveDashboard agentId={agentId} />
}
