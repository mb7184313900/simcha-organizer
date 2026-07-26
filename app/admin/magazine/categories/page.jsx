'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../../../components/Footer'
import Link from 'next/link'
import MagazineAdminNav from '../../../../components/MagazineAdminNav'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

export default function MagazineCategoriesAdmin() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

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
      loadCategories()
    }
    checkAccess()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      setErrorMsg('Failed to load categories.')
    } else {
      setCategories(data)
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    setErrorMsg(null)

    const nextSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sort_order || 0)) + 1
      : 1

    const { error } = await supabase
      .from('vendor_categories')
      .insert({ name: newName.trim(), sort_order: nextSortOrder })

    if (error) {
      setErrorMsg('Failed to add category.')
    } else {
      setNewName('')
      loadCategories()
    }
    setAdding(false)
  }

  const startEditing = (category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  const saveEditing = async (id) => {
    if (!editingName.trim()) return
    setErrorMsg(null)

    const { error } = await supabase
      .from('vendor_categories')
      .update({ name: editingName.trim() })
      .eq('id', id)

    if (error) {
      setErrorMsg('Failed to update category.')
    } else {
      setEditingId(null)
      setEditingName('')
      loadCategories()
    }
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete category "${name}"? This cannot be undone.`)
    if (!confirmed) return

    setErrorMsg(null)

    const { error } = await supabase
      .from('vendor_categories')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMsg('Failed to delete category. It may still have vendors assigned to it.')
    } else {
      loadCategories()
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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl font-serif text-[#141d33] mt-4 mb-2">Magazine Categories</h1>
        <p className="text-gray-500 mb-8">
          Manage the vendor categories shown in the Simcha Magazine Vendor Directory.
        </p>
        <MagazineAdminNav />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Add new category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-serif text-[#141d33] mb-4">Add New Category</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Balloon Artists"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="bg-[#141d33] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2b4d] disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Category list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-serif text-[#141d33]">
              Current Categories ({categories.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-400 italic p-6">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 italic p-6">No categories yet. Add one above.</p>
          ) : (
            <ul>
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="px-6 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  {editingId === category.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(category.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(category.id)}
                        className="text-sm text-white bg-[#141d33] px-4 py-1.5 rounded-lg hover:bg-[#1e2b4d]"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[#141d33]">{category.name}</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => startEditing(category)}
                          className="text-sm text-[#C9A227] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
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