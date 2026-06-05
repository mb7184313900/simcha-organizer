'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Budget() {
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Hall', description: 'Wedding venue', amount: 15000, paid: false },
    { id: 2, category: 'Catering', description: 'Food and drinks', amount: 8000, paid: true },
  ])
  const [form, setForm] = useState({ category: 'Hall', description: '', amount: '' })
  const router = useRouter()

  const categories = ['Hall', 'Catering', 'Music', 'Photography', 'Flowers', 'Clothing', 'Invitations', 'Transportation', 'Other']

  const addExpense = () => {
    if (!form.description || !form.amount) return
    setExpenses(prev => [...prev, { id: Date.now(), ...form, amount: parseFloat(form.amount), paid: false }])
    setForm({ category: 'Hall', description: '', amount: '' })
  }

  const togglePaid = (id) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e))
  }

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const paid = expenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0)
  const remaining = total - paid

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <span className="text-blue-200 text-sm">Budget Organizer</span>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Budget Organizer 💰</h2>
        <p className="text-gray-500 mb-8">Track all your simcha expenses in one place</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-900">${total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">${paid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold text-red-500">${remaining.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-4">Add Expense</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Amount ($)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={addExpense} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">
            Add Expense
          </button>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-2xl border shadow-sm divide-y">
          {expenses.map(e => (
            <div key={e.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={e.paid} onChange={() => togglePaid(e.id)} className="w-4 h-4 accent-blue-900" />
                <div>
                  <p className={`text-sm font-semibold ${e.paid ? 'line-through text-gray-400' : 'text-gray-700'}`}>{e.description}</p>
                  <p className="text-xs text-gray-400">{e.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${e.paid ? 'text-green-600' : 'text-gray-700'}`}>${e.amount.toLocaleString()}</span>
                <button onClick={() => deleteExpense(e.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}