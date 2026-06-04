'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1a3c8f' }}>Welcome to SimchaPro! 🎉</h1>
      <p>Logged in as: {user.email}</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', width: '200px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>📋</div>
          <h3>Simcha Guide</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Step by step planning</p>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', width: '200px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>💰</div>
          <h3>Budget Organizer</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Track your expenses</p>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', width: '200px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>📰</div>
          <h3>Simcha Magazine</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Deals and coupons</p>
        </div>
      </div>
    </div>
  )
}