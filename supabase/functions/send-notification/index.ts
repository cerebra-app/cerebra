import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

webpush.setVapidDetails(
  Deno.env.get('VAPID_MAILTO')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function sendToUser(userId: string, title: string, body: string, type: string) {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (!subs?.length) return

  await Promise.allSettled(
    subs.map(({ subscription }) =>
      webpush.sendNotification(subscription, JSON.stringify({ title, body, type }))
    )
  )
}

serve(async (req) => {
  const { type } = await req.json()
  const today = new Date().toISOString().split('T')[0]

  if (type === 'task_due') {
    // Find all users with high priority tasks due today who have notifications enabled
    const { data: tasks } = await supabase
      .from('tasks')
      .select('user_id, title, profiles!inner(notif_task_due)')
      .eq('due_date', today)
      .eq('is_completed', false)
      .eq('priority', 'high')
      .eq('profiles.notif_task_due', true)

    const grouped = tasks?.reduce((acc: any, task: any) => {
      if (!acc[task.user_id]) acc[task.user_id] = []
      acc[task.user_id].push(task.title)
      return acc
    }, {}) || {}

    for (const [userId, titles] of Object.entries(grouped)) {
      const taskList = (titles as string[])
      await sendToUser(
        userId,
        taskList.length === 1 ? 'Task due today' : `${taskList.length} tasks due today`,
        taskList.length === 1 ? taskList[0] : taskList.slice(0, 2).join(', ') + (taskList.length > 2 ? '...' : ''),
        'task_due'
      )
    }
  }

  if (type === 'journal_reminder') {
    // Find users who haven't written today and have journal reminders on
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('notif_journal_reminder', true)

    const { data: todayEntries } = await supabase
      .from('journal_entries')
      .select('user_id')
      .gte('created_at', today)

    const wroteToday = new Set(todayEntries?.map((e: any) => e.user_id))

    for (const profile of profiles || []) {
      if (!wroteToday.has(profile.id)) {
        await sendToUser(
          profile.id,
          'How was your day?',
          'Take a moment to write in your journal.',
          'journal_reminder'
        )
      }
    }
  }

  if (type === 'streak_reminder') {
    // Find users who haven't checked in today and have streak reminders on
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('notif_streak', true)

    const { data: todayStreaks } = await supabase
      .from('streaks')
      .select('user_id')
      .eq('checked_in_date', today)

    const checkedIn = new Set(todayStreaks?.map((s: any) => s.user_id))

    for (const profile of profiles || []) {
      if (!checkedIn.has(profile.id)) {
        await sendToUser(
          profile.id,
          "Don't break your streak!",
          "Check in today to keep your study streak going.",
          'streak_reminder'
        )
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})