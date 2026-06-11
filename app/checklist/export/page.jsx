'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

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

export default function ExportPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userItems, setUserItems] = useState({})
  const [selected, setSelected] = useState({})
  const [isPrinting, setIsPrinting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const now = new Date()
      if (!sub || new Date(sub.expires_at) <= now) {
        router.push('/checklist')
        return
      }

      setUser(user)

      const { data: rows } = await supabase
        .from('checklist_v2')
        .select('*')
        .eq('user_id', user.id)

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

        built[listKey] = [...defaultItems, ...customItems].filter(i => !i.removed)
      })

      setUserItems(built)

      // Select all by default
      const allSelected = {}
      Object.keys(CHECKLISTS).forEach(k => { allSelected[k] = true })
      setSelected(allSelected)

      setLoading(false)
    }
    init()
  }, [])

  const toggleAll = (val) => {
    const newSelected = {}
    Object.keys(CHECKLISTS).forEach(k => { newSelected[k] = val })
    setSelected(newSelected)
  }

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 300)
  }

  const selectedKeys = Object.keys(selected).filter(k => selected[k])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .print-section { page-break-inside: avoid; margin-bottom: 32px; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      {/* Screen view */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center no-print">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/checklist')}>← Back to Checklist</h1>
          <button
            onClick={handlePrint}
            className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Selection panel */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8 no-print">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">Choose checklists to export</h2>
              <div className="flex gap-3">
                <button onClick={() => toggleAll(true)} className="text-xs text-blue-700 underline">Select all</button>
                <button onClick={() => toggleAll(false)} className="text-xs text-gray-400 underline">Deselect all</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(CHECKLISTS).map(key => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!!selected[key]}
                    onChange={e => setSelected(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-blue-900"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-900">{CHECKLIST_LABELS[key]}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {(userItems[key] || []).length} items
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview / Print content */}
          {selectedKeys.length === 0 ? (
            <div className="text-center text-gray-400 py-12 no-print">Select at least one checklist to preview</div>
          ) : (
            <div>
              {/* Print header */}
              <div className="print-only mb-8">
                <h1 className="text-3xl font-bold text-blue-900">SimchaPro — Simcha Checklist</h1>
                <p className="text-gray-500 text-sm mt-1">Printed on {new Date().toLocaleDateString()}</p>
              </div>

              {selectedKeys.map(key => {
                const listItems = userItems[key] || []
                const unchecked = listItems.filter(i => !i.checked)
                const checked = listItems.filter(i => i.checked)
                return (
                  <div key={key} className="print-section bg-white rounded-2xl border shadow-sm mb-6 overflow-hidden">
                    <div className="bg-blue-900 text-white px-6 py-3">
                      <h3 className="font-bold text-lg">{CHECKLIST_LABELS[key]}</h3>
                    </div>
                    <div className="divide-y">
                      {unchecked.map(item => (
                        <div key={item.text} className="flex items-start gap-3 px-6 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm text-gray-700">{item.text}</span>
                            {item.date && (
                              <span className="ml-2 text-xs text-blue-600 font-medium">({item.date})</span>
                            )}
                            {item.isCustom && (
                              <span className="ml-2 text-xs text-blue-400">custom</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {checked.map(item => (
                        <div key={item.text} className="flex items-start gap-3 px-6 py-3 bg-gray-50">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-900 bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm text-gray-400 line-through">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}