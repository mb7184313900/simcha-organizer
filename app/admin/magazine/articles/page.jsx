'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../../../components/Footer'
import Link from 'next/link'
import MagazineAdminNav from '../../../../components/MagazineAdminNav'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

function emptyForm() {
  return {
    id: null,
    title: '',
    hero_image_url: '',
    is_published: true,
  }
}

function EditorToolbarButton({ onClick, active, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded border ${
        active
          ? 'bg-[#141d33] text-white border-[#141d33]'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

// The visual rich text editor.
// IMPORTANT: `content` is only used as the INITIAL value when the editor
// mounts. TipTap does not auto-update the doc if `content` changes later
// on its own -- that's what caused the bug. To force the editor to load
// fresh HTML (e.g. coming back from HTML Source mode), the parent calls
// the exposed `setHtml` function via `editorRef`, which calls TipTap's
// official `editor.commands.setContent(html)` -- the real equivalent of
// `visualEditor.innerHTML = htmlSource.value`.
function RichTextEditor({ content, onChange, onInsertImage, editorRef }) {
  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Expose the editor instance to the parent so it can push new HTML
  // into it on demand (used when switching HTML Source -> Visual Editor).
  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-lg">
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="Bold"
        />
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="Italic"
        />
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="Heading"
        />
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="Bullet List"
        />
        <EditorToolbarButton
          onClick={onInsertImage}
          active={false}
          label="Insert Image"
        />
      </div>
      <EditorContent
        editor={editor}
        className="max-w-none p-4 min-h-[250px] focus:outline-none [&_.ProseMirror]:min-h-[230px] [&_.ProseMirror]:outline-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#141d33] [&_h2]:mb-2 [&_h2]:mt-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic"
      />
    </div>
  )
}

export default function MagazineArticlesAdmin() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [body, setBody] = useState('')
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [editorKey, setEditorKey] = useState(0)
  const editorRef = useRef(null)

  const [htmlMode, setHtmlMode] = useState(false)
  const [htmlDraft, setHtmlDraft] = useState('')

  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setAuthorized(true)
      setChecking(false)
      loadArticles()
    }
    checkAccess()
  }, [])

  const loadArticles = async () => {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg('Failed to load articles.')
    } else {
      setArticles(data)
    }
    setLoading(false)
  }

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const uploadImage = async (file, folder) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from('magazine-images')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('magazine-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleInsertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return

      try {
        setUploading(true)
        const url = await uploadImage(file, 'articles/inline')
        setBody(prev => prev + `<img src="${url}" />`)
        setEditorKey(prev => prev + 1)
      } catch (err) {
        setErrorMsg('Failed to upload image.')
      }
      setUploading(false)
    }
    input.click()
  }

  // Switches from the visual editor into raw HTML source view.
  const enterHtmlMode = () => {
    // Pull the freshest HTML straight from the live editor instance,
    // rather than relying only on the `body` state (which only updates
    // on each keystroke via onUpdate -- this is just extra safety).
    const latestHtml = editorRef.current ? editorRef.current.getHTML() : body
    setHtmlDraft(latestHtml)
    setHtmlMode(true)
  }

  // Switches back from raw HTML source view into the visual editor.
  // This is the key fix: instead of only remounting the editor and hoping
  // the new `content` prop takes effect, we explicitly push the HTML into
  // the live editor using TipTap's official command -- the real equivalent
  // of `visualEditor.innerHTML = htmlSource.value`.
  const exitHtmlMode = () => {
    setBody(htmlDraft)
    setHtmlMode(false)

    // Give React a tick to render the RichTextEditor (it was unmounted
    // while in HTML mode), then push the HTML into the fresh editor.
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.commands.setContent(htmlDraft, false)
      }
    }, 0)

    // Also bump the key as a fallback safety net in case the editor
    // instance isn't ready yet when the timeout fires.
    setEditorKey(prev => prev + 1)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setErrorMsg('Title is required.')
      return
    }

    // If currently in HTML mode, make sure the latest typed HTML is used.
    // Otherwise, pull the freshest HTML directly from the live editor
    // instance rather than relying only on the `body` state.
    const finalBody = htmlMode
      ? htmlDraft
      : (editorRef.current ? editorRef.current.getHTML() : body)

    setSaving(true)
    setErrorMsg(null)

    try {
      let heroImageUrl = form.hero_image_url

      if (heroImageFile) {
        setUploading(true)
        heroImageUrl = await uploadImage(heroImageFile, 'articles/hero')
        setUploading(false)
      }

      const payload = {
        title: form.title.trim(),
        hero_image_url: heroImageUrl,
        body: finalBody,
        is_published: form.is_published,
      }

      let error
      if (form.id) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', form.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('articles')
          .insert(payload)
        error = insertError
      }

      if (error) {
        setErrorMsg('Failed to save article.')
      } else {
        setForm(emptyForm())
        setBody('')
        setHtmlDraft('')
        setHtmlMode(false)
        setHeroImageFile(null)
        setEditorKey(prev => prev + 1)
        loadArticles()
      }
    } catch (err) {
      setErrorMsg('Image upload failed. Please try again.')
      setUploading(false)
    }

    setSaving(false)
  }

  const startEdit = (article) => {
    setForm({
      id: article.id,
      title: article.title || '',
      hero_image_url: article.hero_image_url || '',
      is_published: article.is_published,
    })
    setBody(article.body || '')
    setHtmlDraft(article.body || '')
    setHtmlMode(false)
    setHeroImageFile(null)
    setEditorKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setForm(emptyForm())
    setBody('')
    setHtmlDraft('')
    setHtmlMode(false)
    setHeroImageFile(null)
    setEditorKey(prev => prev + 1)
  }

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete article "${title}"? This cannot be undone.`)
    if (!confirmed) return

    setErrorMsg(null)

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMsg('Failed to delete article.')
    } else {
      loadArticles()
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Checking access...</p>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl font-serif text-[#141d33] mt-4 mb-2">Magazine Articles</h1>
        <p className="text-gray-500 mb-8">
          Write and manage articles shown in the Simcha Magazine.
        </p>

        <MagazineAdminNav />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-serif text-[#141d33] mb-4">
            {form.id ? 'Edit Article' : 'Write New Article'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Hero Image (top of article)</label>
              {form.hero_image_url && (
                <img src={form.hero_image_url} alt="Current hero" className="h-24 rounded mb-2 border border-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">Article Body *</label>
                {!htmlMode ? (
                  <button
                    type="button"
                    onClick={enterHtmlMode}
                    className="text-xs text-[#C9A227] hover:underline"
                  >
                    Switch to HTML Source
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={exitHtmlMode}
                    className="text-xs text-[#C9A227] hover:underline"
                  >
                    Switch to Visual Editor
                  </button>
                )}
              </div>

              {htmlMode ? (
                <textarea
                  value={htmlDraft}
                  onChange={(e) => setHtmlDraft(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  placeholder="<p>Paste or type raw HTML here...</p>"
                />
              ) : (
                <RichTextEditor
                  key={editorKey}
                  content={body}
                  onChange={setBody}
                  onInsertImage={handleInsertImage}
                  editorRef={editorRef}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
              />
              <label htmlFor="is_published" className="text-sm text-gray-600">
                Published (visible to users)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-[#141d33] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2b4d] disabled:opacity-50"
              >
                {uploading ? 'Uploading images...' : saving ? 'Saving...' : form.id ? 'Save Changes' : 'Publish Article'}
              </button>
              {form.id && (
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 px-6 py-2 rounded-lg hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Article list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-serif text-[#141d33]">
              Current Articles ({articles.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-400 italic p-6">Loading articles...</p>
          ) : articles.length === 0 ? (
            <p className="text-gray-400 italic p-6">No articles yet. Write one above.</p>
          ) : (
            <ul>
              {articles.map((article) => (
                <li
                  key={article.id}
                  className="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {article.hero_image_url ? (
                      <img
                        src={article.hero_image_url}
                        alt={article.title}
                        className="w-12 h-12 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200" />
                    )}
                    <div>
                      <p className="text-[#141d33] font-medium">{article.title}</p>
                      <p className="text-xs text-gray-500">
                        {!article.is_published && 'Unpublished'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(article)}
                      className="text-sm text-[#C9A227] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}