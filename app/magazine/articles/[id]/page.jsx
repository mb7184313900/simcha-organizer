import { supabase } from '../../../../lib/supabase'
import ArticleClient from './ArticleClient'

// This runs on the server before the page loads, so link previews on
// WhatsApp, Facebook, iMessage, etc. can show the specific article's
// title and image instead of a generic SimchaPro logo.
export async function generateMetadata({ params }) {
  const { id } = await params

  const { data: article } = await supabase
    .from('articles')
    .select('title, hero_image_url, body')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (!article) {
    return {
      title: 'Simcha Magazine | SimchaPro',
    }
  }

  // Build a short plain-text description from the HTML body for the preview.
  const plainText = (article.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = plainText.slice(0, 160)

  return {
    title: `${article.title} | Simcha Magazine`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.hero_image_url ? [{ url: article.hero_image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.hero_image_url ? [article.hero_image_url] : [],
    },
  }
}

export default function ArticleDetailPage() {
  return <ArticleClient />
}