'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CHECKLISTS = {
  'Lchaim': [
    'Book a venue or arrange a home gathering',
    'Set a date with both families',
    'Create a guest list',
    'Arrange catering or food platters',
    'Order a vort cake',
    'Organize music or background playlist',
    'Send invitations or make phone calls',
    'Arrange seating',
    'Prepare vort speech or divrei Torah',
    'Coordinate timing with both families',
    'Arrange flowers or centerpieces',
    'Prepare l\'chaim drinks and cups',
  ],
  'Tnaim': [
    'Set the date with both families',
    'Choose a rav to officiate',
    'Write up the tenaim document',
    'Arrange a small seudah',
    'Prepare plate for breaking ceremony',
    'Invite close family only',
    'Coordinate with mesader kiddushin',
    'Arrange for a minyan if needed',
    'Prepare short divrei Torah',
    'Order food or catering',
  ],
  'After Shidduch': [
    'Announce the engagement to family and friends',
    'Post engagement on social media (if desired)',
    'Begin venue search for wedding',
    'Start wedding date discussions with both families',
    'Open a joint planning checklist with mechutanim',
    'Begin dress shopping research',
    'Begin hall research and tours',
    'Discuss rough guest list numbers with both families',
    'Set up a budget conversation',
    'Research photographers',
    'Research bands or DJs',
    'Look into kallah classes',
    'Look into chosson classes',
  ],
  'Traditional Gifts': [
    'Chosson gifts to kallah: jewelry (ring, necklace, bracelet)',
    'Kallah gifts to chosson: watch, cufflinks, or tie',
    'Mechutanim gift to chosson: suit or hat',
    'Mechutanim gift to kallah: dress or jewelry',
    'Vort gift from chosson\'s family to kallah',
    'Vort gift from kallah\'s family to chosson',
    'Erev Chasunah gift exchange between chosson & kallah',
    'Gift of a Siddur or Tehillim',
    'Family heirlooms or meaningful keepsakes',
  ],
  'Chosson & Kallah Clothing': [
    'Wedding dress — order and fittings',
    'Veil and headpiece',
    'Shoes for the wedding',
    'Jewelry for the wedding',
    'Underpinnings and undergarments',
    'Hair and makeup trial',
    'Robe or dressing gown for getting ready',
    'Something old, new, borrowed, blue',
    'Chosson\'s suit or frock',
    'Chosson\'s hat (black hat)',
    'Chosson\'s gartel',
    'Chosson\'s kittel',
    'Chosson\'s shoes',
    'Chosson\'s tie and shirt',
    'Vort dress for kallah',
    'Shabbos Shiva dress(es)',
    'Sheva Brachos outfits (multiple nights)',
    'Comfortable shoes for reception',
  ],
  'Mechutanim & Family': [
    'Mother of kallah — wedding outfit',
    'Mother of chosson — wedding outfit',
    'Father of kallah — suit or frock',
    'Father of chosson — suit or frock',
    'Siblings outfits coordinated',
    'Flower girl dress',
    'Ring bearer outfit',
    'Family photos scheduled',
    'Hotel accommodations arranged for out-of-town family',
    'Transportation arranged for immediate family',
    'Assign family roles for the wedding day (ushers, greeters)',
    'Prepare family seating chart',
    'Share timeline with immediate family',
  ],
  'Apartment': [
    'Finalize apartment location and sign lease',
    'Measure rooms before buying furniture',
    'Order bedroom set',
    'Order living room furniture',
    'Order dining room table and chairs',
    'Order couch and seating',
    'Arrange for appliances (fridge, stove, washer/dryer)',
    'Set up internet service',
    'Set up electricity and gas',
    'Arrange for movers',
    'Purchase bedroom linens and pillows',
    'Purchase towels and bathroom items',
    'Purchase kitchen basics (pots, pans, utensils)',
    'Purchase cleaning supplies',
    'Hang mezuzos',
    'Set up shabbos clock and timer',
    'Arrange for two sets of dishes (fleishig/milchig)',
    'Purchase two sets of pots and pans',
    'Arrange toivel (toiveling) of dishes and utensils',
  ],
  'Shabbos Bavarfen': [
    'Choose a hosting shul',
    'Coordinate with gabbai for aliyah',
    'Arrange Shabbos meals — Friday night and Shabbos day',
    'Invite family and friends',
    'Arrange accommodations for out-of-town guests',
    'Plan Shabbos Mevorchim if applicable',
    'Prepare divrei Torah for Shabbos table',
    'Arrange Shalosh Seudos',
    'Coordinate Havdalah',
    'Plan Melave Malka if desired',
    'Prepare mishloach manos or gifts for guests (if applicable)',
  ],
  'Before the Wedding': [
    'Confirm hall and caterer',
    'Confirm photographer and videographer',
    'Confirm band or DJ',
    'Confirm florist',
    'Confirm hair and makeup',
    'Confirm transportation',
    'Submit final guest count to caterer',
    'Finalize seating chart',
    'Prepare ketubah — confirm spelling of names with rav',
    'Pick up wedding rings',
    'Prepare envelopes for vendors (tips and payments)',
    'Write out wedding day timeline',
    'Share timeline with family and wedding party',
    'Prepare wedding day emergency kit',
    'Arrange for someone to bustle the dress',
    'Confirm hotel suite or night accommodations',
    'Prepare gifts for wedding party',
    'Fast day (taanis) for chosson and kallah (if applicable)',
    'Chosson goes to mikveh',
    'Kallah goes to mikveh',
    'Prepare kvitlach if going to a kever',
    'Break a fast after Maariv/Mincha on wedding day',
  ],
  'Wedding (Take to Hall)': [
    'Wedding dress (in garment bag)',
    'Chosson\'s kittel and gartel',
    'Veil and headpiece',
    'Shoes for chosson and kallah',
    'Jewelry',
    'Ketubah (signed before chuppah)',
    'Wedding rings',
    'Badeken veil (if separate from chuppah veil)',
    'Chuppah poles or confirm with hall',
    'Kiddush cup',
    'Wine for chuppah',
    'Glass for breaking under chuppah',
    'Camera and charger',
    'Emergency kit (safety pins, tide pen, bobby pins, pain relief)',
    'Touch-up makeup bag',
    'Phone charger',
    'Cash for tips — in labeled envelopes',
    'Guest list and seating chart (printed)',
    'Place cards for seating',
    'Menu cards (if applicable)',
    'Benchers / bentching booklets',
    'Candles for badeken (if minhag)',
    'Flower girl basket and petals',
    'Bag for gifts received at wedding',
    'Change of shoes for dancing',
    'Light snacks for bridal suite',
  ],
  'Sheva Brachos': [
    'Set dates for all 7 nights',
    'Confirm hosts for each night',
    'Share guest list with each host',
    'Arrange transportation for chosson and kallah each night',
    'Prepare divrei Torah for each night',
    'Confirm a minyan for bentching each night',
    'Coordinate kos shel bracha',
    'Prepare outfits for each night',
    'Thank you notes or calls to hosts after each night',
    'Confirm final night\'s seudah details',
    'Arrange childcare for family members if needed',
    'Rest and enjoy!',
  ],
  'Housewares': [
    'Bedroom set (bed frame, dresser, nightstands)',
    'Mattress and box spring',
    'Pillows (fleece and feather)',
    'Duvet and duvet cover',
    'Fitted sheets and pillowcases (2+ sets)',
    'Blankets',
    'Towels — bath, hand, face (2 sets)',
    'Bath mat and shower curtain',
    'Toilet brush and plunger',
    'Mirror',
    'Laundry hamper',
    'Drying rack or hangers',
    'Iron and ironing board',
    'Dining table and chairs',
    'Couch and seating',
    'Coffee table and side tables',
    'Lamps',
    'Bookshelf or storage unit',
    'Desk and chair (if working from home)',
    'TV stand or entertainment unit',
    'Kitchen table (if separate from dining)',
    'High chair (for future — optional)',
    'Shabbos tablecloths (2+)',
    'Shabbos candlesticks',
    'Kiddush cup(s)',
    'Challah board and knife',
    'Challah covers',
    'Havdalah set (besomim, ner, kos)',
    'Menorah',
    'Shabbos hot plate or blech',
    'Shabbos clock / timer',
    'Mezuzos for all doorways',
    'Siddur and Tehillim (his & hers)',
    'Benchers',
  ],
  'Grocery': [
    'Oils and cooking sprays',
    'Salt, pepper, and basic spices',
    'Sugar and honey',
    'Flour and baking supplies',
    'Pasta, rice, and grains',
    'Canned tomatoes and tomato paste',
    'Canned beans and lentils',
    'Chicken stock or broth',
    'Soy sauce and condiments',
    'Vinegar (white and apple cider)',
    'Olive oil and vegetable oil',
    'Coffee and tea',
    'Cereal and oatmeal',
    'Bread and crackers',
    'Peanut butter and jam',
    'Eggs',
    'Milk (or non-dairy alternative)',
    'Butter or margarine',
    'Cheese selection',
    'Yogurt',
    'Fresh fruit (weekly)',
    'Fresh vegetables (weekly)',
    'Frozen vegetables',
    'Frozen chicken or meat',
    'Fish (fresh or frozen)',
    'Onions, garlic, potatoes',
    'Paper towels and napkins',
    'Aluminum foil and plastic wrap',
    'Ziplock bags (various sizes)',
    'Garbage bags',
    'Dish soap and sponges',
    'Hand soap',
    'Shabbos candles',
    'Grape juice or wine for kiddush',
    'Challah (or flour to bake)',
  ],
}

const CHECKLIST_LABELS = {
  'Lchaim': "🥂 L'chaim",
  'Tnaim': '📜 Tnaim',
  'After Shidduch': '💍 After the Shidduch',
  'Traditional Gifts': '🎁 Traditional Gifts',
  'Chosson & Kallah Clothing': '👗 Chosson & Kallah Clothing',
  'Mechutanim & Family': '👨‍👩‍👧 Mechutanim & Family',
  'Apartment': '🏠 Apartment',
  'Shabbos Bavarfen': '🕍 Shabbos Bavarfen',
  'Before the Wedding': '📅 Before the Wedding',
  'Wedding (Take to Hall)': '💒 Wedding (Take to Hall)',
  'Sheva Brachos': '🎉 Sheva Brachos',
  'Housewares': '🛋️ Housewares',
  'Grocery': '🛒 Grocery',
}

export default function ChecklistPage() {
  const [user, setUser] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeList, setActiveList] = useState('Lchaim')
  const [items, setItems] = useState({})
  const [newItemText, setNewItemText] = useState('')
  const [dateInputs, setDateInputs] = useState({})
  const [removedItems, setRemovedItems] = useState({})
  const [showRemoved, setShowRemoved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const now = new Date()
      const paid = sub && new Date(sub.expires_at) > now
      setIsPaid(!!paid)

      if (paid) {
        await loadUserData(user.id)
      } else {
        // Initialize items for free users (view only, no state)
        const initial = {}
        Object.keys(CHECKLISTS).forEach(k => {
          initial[k] = CHECKLISTS[k].map(text => ({ text, checked: false, removed: false, date: null, isCustom: false }))
        })
        setItems(initial)
      }

      setLoading(false)
    }
    init()
  }, [])

  const loadUserData = async (userId) => {
    const { data: rows } = await supabase
      .from('checklist_v2')
      .select('*')
      .eq('user_id', userId)

    const built = {}
    Object.keys(CHECKLISTS).forEach(listKey => {
      const saved = rows?.filter(r => r.list_key === listKey) || []
      const savedMap = {}
      saved.forEach(r => { savedMap[r.item_text] = r })

      const defaultItems = CHECKLISTS[listKey].map(text => {
        const s = savedMap[text]
        return {
          text,
          checked: s ? s.checked : false,
          removed: s ? s.removed : false,
          date: s ? s.item_date : null,
          isCustom: false,
        }
      })

      const customItems = saved.filter(r => r.is_custom).map(r => ({
        text: r.item_text,
        checked: r.checked,
        removed: r.removed,
        date: r.item_date,
        isCustom: true,
      }))

      built[listKey] = [...defaultItems, ...customItems]
    })
    setItems(built)
  }

  const saveItem = async (listKey, itemText, updates) => {
    if (!user) return
    const { data: existing } = await supabase
      .from('checklist_v2')
      .select('id')
      .eq('user_id', user.id)
      .eq('list_key', listKey)
      .eq('item_text', itemText)
      .single()

    if (existing) {
      await supabase.from('checklist_v2').update(updates).eq('id', existing.id)
    } else {
      await supabase.from('checklist_v2').insert({
        user_id: user.id,
        list_key: listKey,
        item_text: itemText,
        ...updates,
      })
    }
  }

  const toggleCheck = async (listKey, itemText) => {
    if (!isPaid) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, checked: !i.checked } : i
      )
      return { ...prev, [listKey]: updated }
    })
    const item = items[listKey].find(i => i.text === itemText)
    await saveItem(listKey, itemText, { checked: !item.checked, is_custom: item.isCustom || false })
  }

  const removeItem = async (listKey, itemText) => {
    if (!isPaid) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, removed: true } : i
      )
      return { ...prev, [listKey]: updated }
    })
    await saveItem(listKey, itemText, { removed: true })
  }

  const addBackItem = async (listKey, itemText) => {
    if (!isPaid) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, removed: false } : i
      )
      return { ...prev, [listKey]: updated }
    })
    await saveItem(listKey, itemText, { removed: false })
  }

  const addCustomItem = async () => {
    if (!isPaid || !newItemText.trim()) return
    const text = newItemText.trim()
    setItems(prev => ({
      ...prev,
      [activeList]: [...(prev[activeList] || []), { text, checked: false, removed: false, date: null, isCustom: true }]
    }))
    setNewItemText('')
    await supabase.from('checklist_v2').insert({
      user_id: user.id,
      list_key: activeList,
      item_text: text,
      checked: false,
      removed: false,
      is_custom: true,
      item_date: null,
    })
  }

  const setItemDate = async (listKey, itemText, date) => {
    if (!isPaid) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, date } : i
      )
      return { ...prev, [listKey]: updated }
    })
    await saveItem(listKey, itemText, { item_date: date || null })
  }

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  }

  const exportToPDF = () => {
    const list = items[activeList] || []
    const visible = list.filter(i => !i.removed)
    const lines = visible.map(i => `[${i.checked ? 'x' : ' '}] ${i.text}${i.date ? ` (${i.date})` : ''}`)
    const content = `${CHECKLIST_LABELS[activeList] || activeList}\n\n${lines.join('\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeList.replace(/\s+/g, '_')}_checklist.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSortedItems = (listKey) => {
    const all = items[listKey] || []
    const visible = all.filter(i => !i.removed)
    const withDate = visible.filter(i => i.date && !i.checked).sort((a, b) => new Date(a.date) - new Date(b.date))
    const unchecked = visible.filter(i => !i.date && !i.checked)
    const checked = visible.filter(i => i.checked)
    return { withDate, unchecked, checked }
  }

  const removedList = (items[activeList] || []).filter(i => i.removed)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>

  const { withDate, unchecked, checked } = getSortedItems(activeList)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <span className="text-blue-200 text-sm">Simcha Checklist</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Simcha Checklist 📋</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-xl">
          Planning a wedding can be overwhelming. We've gathered practical checklists, traditional customs, and planning guides to help keep everything organized from the Shidduch through the Sheva Brachos.
        </p>

        {/* Upgrade Banner for free users */}
        {!isPaid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">You're viewing a preview</p>
              <p className="text-yellow-700 text-sm">Upgrade to check off items, add custom tasks, set dates, and export to PDF.</p>
            </div>
            <a href="/pricing" className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center">
              Upgrade Now
            </a>
          </div>
        )}

        {/* Checklist Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {Object.keys(CHECKLISTS).map(key => (
            <button
              key={key}
              onClick={() => { setActiveList(key); setShowRemoved(false); setNewItemText('') }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeList === key
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-blue-900 border-blue-200 hover:border-blue-900 hover:bg-blue-50'
              }`}
            >
              {CHECKLIST_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Active Checklist */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50">
            <h3 className="font-bold text-blue-900 text-lg">{CHECKLIST_LABELS[activeList]}</h3>
            {isPaid && (
              <button onClick={exportToPDF} className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 font-semibold">
                Export ↓
              </button>
            )}
          </div>

          {/* Items with dates (paid only) */}
          {isPaid && withDate.length > 0 && (
            <div className="divide-y border-b">
              {withDate.map(item => {
                const days = getDaysUntil(item.date)
                return (
                  <ItemRow
                    key={item.text}
                    item={item}
                    isPaid={isPaid}
                    days={days}
                    onToggle={() => toggleCheck(activeList, item.text)}
                    onRemove={() => removeItem(activeList, item.text)}
                    onSetDate={(d) => setItemDate(activeList, item.text, d)}
                    dateInputs={dateInputs}
                    setDateInputs={setDateInputs}
                    highlight
                  />
                )
              })}
            </div>
          )}

          {/* Unchecked items */}
          <div className="divide-y">
            {unchecked.map(item => (
              <ItemRow
                key={item.text}
                item={item}
                isPaid={isPaid}
                days={null}
                onToggle={() => toggleCheck(activeList, item.text)}
                onRemove={() => removeItem(activeList, item.text)}
                onSetDate={(d) => setItemDate(activeList, item.text, d)}
                dateInputs={dateInputs}
                setDateInputs={setDateInputs}
              />
            ))}
          </div>

          {/* Checked items */}
          {isPaid && checked.length > 0 && (
            <div className="divide-y border-t bg-gray-50">
              {checked.map(item => (
                <ItemRow
                  key={item.text}
                  item={item}
                  isPaid={isPaid}
                  days={null}
                  onToggle={() => toggleCheck(activeList, item.text)}
                  onRemove={() => removeItem(activeList, item.text)}
                  onSetDate={(d) => setItemDate(activeList, item.text, d)}
                  dateInputs={dateInputs}
                  setDateInputs={setDateInputs}
                />
              ))}
            </div>
          )}

          {/* Add custom item */}
          {isPaid && (
            <div className="px-6 py-4 border-t flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomItem()}
                placeholder="Add a custom item..."
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={addCustomItem}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Removed items section */}
        {isPaid && removedList.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowRemoved(v => !v)}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              {showRemoved ? 'Hide' : 'Show'} removed items ({removedList.length})
            </button>
            {showRemoved && (
              <div className="mt-3 bg-white rounded-xl border divide-y shadow-sm">
                {removedList.map(item => (
                  <div key={item.text} className="flex items-center justify-between px-6 py-3 gap-4">
                    <span className="text-sm text-gray-400 line-through">{item.text}</span>
                    <button
                      onClick={() => addBackItem(activeList, item.text)}
                      className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-50 font-semibold whitespace-nowrap"
                    >
                      Add back
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ItemRow({ item, isPaid, days, onToggle, onRemove, onSetDate, dateInputs, setDateInputs, highlight }) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <div className={`flex items-start gap-3 px-6 py-4 group ${highlight ? 'bg-blue-50' : ''} ${item.checked ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={isPaid ? onToggle : undefined}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          item.checked
            ? 'bg-blue-900 border-blue-900'
            : isPaid
              ? 'border-gray-300 hover:border-blue-500 cursor-pointer'
              : 'border-gray-200 cursor-default'
        }`}
      >
        {item.checked && <span className="text-white text-xs">✓</span>}
      </button>

      {/* Text + date */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {item.text}
          {item.isCustom && <span className="ml-2 text-xs text-blue-400 font-medium">custom</span>}
        </span>

        {/* Date badge */}
        {item.date && isPaid && (
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              days === 0 ? 'bg-red-100 text-red-700' :
              days < 0 ? 'bg-gray-100 text-gray-500' :
              days <= 7 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {days === 0 ? 'Today!' : days < 0 ? `${Math.abs(days)}d ago` : `${days} day${days === 1 ? '' : 's'} away`}
            </span>
            <span className="text-xs text-gray-400">{item.date}</span>
            <button onClick={() => onSetDate(null)} className="text-xs text-gray-300 hover:text-red-400">✕</button>
          </div>
        )}

        {/* Date picker */}
        {isPaid && showDatePicker && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="date"
              value={dateInputs[item.text] || item.date || ''}
              onChange={e => setDateInputs(prev => ({ ...prev, [item.text]: e.target.value }))}
              className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <button
              onClick={() => { onSetDate(dateInputs[item.text] || ''); setShowDatePicker(false) }}
              className="text-xs bg-blue-900 text-white px-2 py-1 rounded font-semibold hover:bg-blue-800"
            >
              Set
            </button>
            <button onClick={() => setShowDatePicker(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPaid && !item.checked && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!item.date && (
            <button
              onClick={() => setShowDatePicker(v => !v)}
              className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 px-2 py-0.5 rounded-full"
              title="Set date"
            >
              📅
            </button>
          )}
          <button
            onClick={onRemove}
            className="text-xs text-gray-300 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded-full"
            title="Remove"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}