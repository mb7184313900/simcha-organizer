'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Link from 'next/link'

export default function ArticlesListPage() {
  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setArticles(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDashboardClick = () => {
    router.push('/dashboard')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onDashboardClick={handleDashboardClick} />

      <div className="max-w-5xl mx-auto px-6 py-14 flex-1 w-full">
        <Link href="/magazine" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Simcha Magazine
        </Link>

        <h1 className="text-4xl font-serif text-[#141d33] mt-4 mb-10">Articles</h1>

        {loading ? (
          <p className="text-gray-400 italic">Loading articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-400 italic">No articles yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/magazine/articles/${article.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {article.hero_image_url && (
                  <img
                    src={article.hero_image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors">
                    {article.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}