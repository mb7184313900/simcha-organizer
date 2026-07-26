'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'
import Link from 'next/link'

export default function ArticleDetailPage() {
  const [user, setUser] = useState(null)
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', params.id)
        .eq('is_published', true)
        .maybeSingle()

      if (error || !data) {
        setNotFound(true)
      } else {
        setArticle(data)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const handleDashboardClick = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onDashboardClick={handleDashboardClick} />

      <div className="max-w-3xl mx-auto px-6 py-14 flex-1 w-full">
        <Link href="/magazine/articles" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← All Articles
        </Link>

        {notFound ? (
          <p className="text-gray-400 italic mt-8">This article could not be found.</p>
        ) : (
          <article className="mt-6">
            {article.hero_image_url && (
              <img
                src={article.hero_image_url}
                alt={article.title}
                className="w-full h-72 object-cover rounded-xl mb-8"
              />
            )}
            <h1 className="text-4xl font-serif text-[#141d33] mb-8">{article.title}</h1>
            <div
              className="prose max-w-none prose-headings:font-serif prose-headings:text-[#141d33] prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </article>
        )}
      </div>

      <Footer />
    </div>
  )
}