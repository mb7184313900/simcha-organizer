import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { inviteToken } = await req.json()

    if (!inviteToken) {
      return Response.json({ error: 'Missing inviteToken' }, { status: 400 })
    }

    const { data: invite, error } = await supabase
      .from('wedding_invites')
      .select('*')
      .eq('invite_token', inviteToken)
      .single()

    if (error || !invite) {
      return Response.json({ error: 'Invite not found' }, { status: 404 })
    }

    return Response.json({ invite })
  } catch (err) {
    console.error('Lookup invite error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}