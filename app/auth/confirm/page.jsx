'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Image from 'next/image'
import Footer from '../../../components/Footer'

export default function AuthConfirm() {
  const [status, setStatus] = useState('loading') // 'loading' | 'no-session' | 'setup-failed' | 'invite-failed'
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setStatus('no-session')
        return
      }

      const user = session.user
      const inviteToken = user.user_metadata?.invite_token

      if (inviteToken) {
        // Side B confirming an invite — accept it now that their email is
        // verified, instead of running the Side A wedding-setup logic below.
        try {
          const res = await fetch('/api/invite/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, inviteToken })
          })
          const result = await res.json()
          if (!result.success) {
            setStatus('invite-failed')
            return
          }
        } catch (err) {
          setStatus('invite-failed')
          return
        }

        router.push('/dashboard')
        return
      }

      // Idempotent: if this account already has a wedding (e.g. the link was
      // clicked twice, or the redirect fired more than once), skip setup and
      // go straight to the dashboard.
      const { data: existingWedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('side_a_user_id', user.id)
        .maybeSingle()

      if (!existingWedding) {
        const { data: newWedding, error: weddingError } = await supabase
          .from('weddings')
          .insert({
            side_a_user_id: user.id,
            chosson_family: '',
            kallah_family: ''
          })
          .select()
          .single()

        if (weddingError) {
          setStatus('setup-failed')
          return
        }

        const expires_at = new Date()
        expires_at.setDate(expires_at.getDate() + 7)
        const { error: subscriptionError } = await supabase.from('subscriptions').insert({
          user_id: user.id,
          wedding_id: newWedding.id,
          email: user.email,
          plan: 'trial',
          status: 'trial',
          expires_at: expires_at.toISOString(),
        })

        if (subscriptionError) {
          setStatus('setup-failed')
          return
        }

        const { error: settingsError } = await supabase.from('user_settings').upsert(
          { user_id: user.id, active_wedding_id: newWedding.id, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )

        if (settingsError) {
          setStatus('setup-failed')
          return
        }
      }

      router.push('/dashboard')
    }
    run()
  }, [])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <a href="/" className="mb-6">
            <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
          </a>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
            <p className="text-[#5a5a5a]">Confirming your email...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (status === 'setup-failed') {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <a href="/" className="mb-6">
            <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
          </a>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Almost there...</h1>
            <p className="text-[#5a5a5a] mb-6">
              Your email was confirmed, but something went wrong setting up your account. Please try logging in — if the problem continues, contact us at{' '}
              <a href="mailto:info@simchapro.com" className="text-[#141d33] font-semibold hover:text-[#C9A227] underline">info@simchapro.com</a>.
            </p>
            <a href="/login" className="block w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (status === 'invite-failed') {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <a href="/" className="mb-6">
            <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
          </a>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Almost there...</h1>
            <p className="text-[#5a5a5a] mb-6">
              Your email was confirmed, but something went wrong connecting you to the wedding you were invited to. Please try the invite link again — if the problem continues, contact us at{' '}
              <a href="mailto:info@simchapro.com" className="text-[#141d33] font-semibold hover:text-[#C9A227] underline">info@simchapro.com</a>.
            </p>
            <a href="/login" className="block w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <a href="/" className="mb-6">
          <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
        </a>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Link Invalid or Expired</h1>
          <p className="text-[#5a5a5a] mb-6">
            This confirmation link is no longer valid. It may have expired, already been used, or been opened on a different device than the one you signed up on.
          </p>
          <a href="/login" className="block w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors">
            Go to Login
          </a>
        </div>
      </div>
      <Footer />
    </main>
  )
}
