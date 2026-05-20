import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/supabase'

export async function logAudit(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Json
) {
  const supabase = createAdminClient()
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: metadata ?? null,
  })
}
