'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getAccessStatus } from '../../../lib/accessControl'

const CHECKLISTS = {
  'Lchaim': [
    { section: 'Shared', text: 'Payment for the Shadchan' },
    { section: 'Shared', text: 'Thank-you gifts or payments for additional Shadchanim' },
    { section: "Kallah's Side", text: 'Arrange the venue (home or hall)' },
    { section: "Kallah's Side", text: "Cake for the L'chaim" },
    { section: "Kallah's Side", text: "Liqueur / refreshments for the L'chaim" },
    { section: "Chosson's Side", text: 'Bracelet for the Kallah' },
    { section: "Chosson's Side", text: "Cigarettes, pens, and candies for the L'chaim" },
    { section: "First Shabbos After the L'chaim", text: 'Flowers for the Kallah' },
  ],
  'Tnaim': [
    { section: "Kallah's Side", text: 'Hall & Catering' },
    { section: "Kallah's Side", text: 'Tablecloths' },
    { section: "Kallah's Side", text: 'Dishes, Flatware, Cups & Napkins' },
    { section: "Kallah's Side", text: 'Cake & Hot Food' },
    { section: "Kallah's Side", text: 'Liquor & Drinks' },
    { section: "Kallah's Side", text: 'Fruits & Salads' },
    { section: "Kallah's Side", text: 'Photographer' },
    { section: "Kallah's Side", text: 'Hair & Makeup for the Kallah and Family' },
    { section: "Kallah's Side", text: 'Tnoiyim Document (Shtar Tnoiyim)' },
    { section: "Kallah's Side", text: 'Rav/Dayan to officiate' },
    { section: "Kallah's Side", text: 'Plate for Breaking' },
    { section: "Kallah's Side", text: 'Arrange one Eid (witness), Arev Kablan (guarantor)' },
    { section: "Kallah's Side", text: 'Invite Family & Friends' },
    { section: "Chosson's Side", text: 'Diamond Ring' },
    { section: "Chosson's Side", text: 'Flowers & Poem' },
    { section: "Chosson's Side", text: 'Mechitanista Cake' },
    { section: "Chosson's Side", text: 'Invite Family & Friends' },
    { section: "Chosson's Side", text: 'Arrange one Eid (witness), Arev Kablan (guarantor)' },
    { section: "Chosson's Side", text: 'Hair & Makeup for the family' },
  ],
  'After Shidduch': [
    { section: 'Shared', text: 'Begin guest list planning' },
    { section: 'Shared', text: 'Discuss wedding budget' },
    { section: 'Shared', text: 'Start invitation planning' },
    { section: 'Shared', text: 'Reserve out-of-town accommodations if needed' },
    { section: "Kallah's Side", text: 'Set the Wedding Date (Chasuna Date) and confirm hall availability' },
    { section: "Kallah's Side", text: 'Hall for Shabbos Sheva Brachos' },
    { section: "Kallah's Side", text: 'Hairdresser' },
    { section: "Kallah's Side", text: 'Makeup Artist' },
    { section: "Kallah's Side", text: 'Photographer' },
    { section: "Kallah's Side", text: 'Kallah Classes' },
    { section: "Kallah's Side", text: 'Order the wedding gown' },
    { section: "Chosson's Side", text: 'Hall for the Aufruf' },
    { section: "Chosson's Side", text: 'Musician' },
    { section: "Chosson's Side", text: 'Singer' },
    { section: "Chosson's Side", text: 'Singer for the Chuppah' },
    { section: "Chosson's Side", text: 'Badchan for Kabolas Ponim and Mitzvah Tantz' },
    { section: "Chosson's Side", text: 'Chosson Madrich' },
    { section: "Chosson's Side", text: 'Shtreimel' },
    { section: "Chosson's Side", text: 'Rabbeinu Tam Tefillin' },
  ],
  'Traditional Gifts': [
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Watch (traditionally given by the Tnoiyim)' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Shas' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Kiddush Becher' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Mishloach Manos' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Pesach Set' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Haggadah' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Flowers for Shavuos' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Challah Cover' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Machzorim' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Esrog Holder' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Menorah' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Megillah' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Tallis & Tallis Bag' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Kittel' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Hand-Knitted Gartel' },
    { section: "Kallah's Side → Gifts for the Chosson", text: 'Gifts for the Mechutanim' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Bracelet (traditionally given at the Vort/Lechaim)' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Diamond Ring (traditionally given at the Tnoiyim)' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Watch' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Earrings' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Necklace' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Handbag / Evening Bag' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Bosch Mixer' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Baby Album' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Leuchters (Candlesticks)' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Oil Leuchters' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Machzorim' },
    { section: "Chosson's Side → Gifts for the Kallah", text: "Selichos, Techinos & Tz'enah U'Renah" },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Sheitel Tichel / Shirtzel' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Siddur & Tehillim' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Mishloach Manos' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Haggadah' },
    { section: "Chosson's Side → Gifts for the Kallah", text: 'Gifts for the Mechutanim' },
  ],
  'Chosson & Kallah Clothing': [
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Bekeshe' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Tish Bekeshe' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Rezhvolke / Silk Kapote (where customary)' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Extra Vest' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Shabbos Coat' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Shabbos Pants' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Suits' },
    { section: "Chosson's Side - Shabbos & Yom Tov Clothing", text: 'Extra Pants' },
    { section: "Chosson's Side - Shoes", text: 'Shabbos Shoes' },
    { section: "Chosson's Side - Shoes", text: 'Weekday Shoes' },
    { section: "Chosson's Side - Shoes", text: 'Crocs / Slippers' },
    { section: "Chosson's Side - Shoes", text: 'Boots' },
    { section: "Chosson's Side - Shoes", text: 'Overshoes / Rubbers' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Dress Shirts' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Undershirts' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Boxers' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Wool Tzitzis' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Cotton Tzitzis' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Socks' },
    { section: "Chosson's Side - Shirts & Undergarments", text: 'Pajamas / Nightshirt' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Kappel' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Schlaf Kappel' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Hats' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Hat Brush' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Comb / Hair Brush' },
    { section: "Chosson's Side - Headwear & Accessories", text: 'Belt' },
    { section: "Chosson's Side - Outerwear", text: 'Yeshiva Chalat' },
    { section: "Chosson's Side - Outerwear", text: 'Shabbos Gartel' },
    { section: "Chosson's Side - Outerwear", text: 'Sweater' },
    { section: "Chosson's Side - Outerwear", text: 'Shabbos Scarf' },
    { section: "Chosson's Side - Outerwear", text: 'Winter Scarf' },
    { section: "Chosson's Side - Outerwear", text: 'Ear Muffs' },
    { section: "Chosson's Side - Outerwear", text: 'Raincoat' },
    { section: "Chosson's Side - Outerwear", text: 'Gloves' },
    { section: "Chosson's Side - Outerwear", text: 'Umbrella' },
    { section: "Chosson's Side - Travel & Personal Items", text: 'Garment Bag' },
    { section: "Chosson's Side - Travel & Personal Items", text: 'Wallet' },
    { section: "Chosson's Side - Travel & Personal Items", text: 'Swimwear' },
    { section: "Chosson's Side - Travel & Personal Items", text: 'Eyeglasses / Contact Lenses' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Wedding Gown' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Petticoat' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Crown' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Veil' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Headpiece' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'Fur Cape' },
    { section: "Kallah's Side - Wedding Gown & Accessories", text: 'White Shoes' },
    { section: "Kallah's Side - Coats & Outerwear", text: 'Spring Jacket' },
    { section: "Kallah's Side - Coats & Outerwear", text: 'Raincoat' },
    { section: "Kallah's Side - Coats & Outerwear", text: 'Shabbos Coat' },
    { section: "Kallah's Side - Coats & Outerwear", text: 'Weekday Coat' },
    { section: "Kallah's Side - Shoes", text: 'Shabbos Shoes' },
    { section: "Kallah's Side - Shoes", text: 'Weekday Shoes' },
    { section: "Kallah's Side - Shoes", text: 'Yom Kippur Shoes' },
    { section: "Kallah's Side - Shoes", text: 'Boots' },
    { section: "Kallah's Side - Shoes", text: 'Sneakers' },
    { section: "Kallah's Side - Shoes", text: 'Slippers / Crocs' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Sheitel / Shpitzel' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Wig Box' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Foam Head' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Travel Wig Stand' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Comb / Wig Brush' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Shabbos Hats, Bands & Tichels' },
    { section: "Kallah's Side - Head Coverings & Wig Accessories", text: 'Weekday Hats, Bands & Tichels' },
    { section: "Kallah's Side - Dresses, Tops & Skirts", text: 'Shabbos Dresses (Summer & Winter)' },
    { section: "Kallah's Side - Dresses, Tops & Skirts", text: 'Weekday Dresses (Summer & Winter)' },
    { section: "Kallah's Side - Dresses, Tops & Skirts", text: 'Tops' },
    { section: "Kallah's Side - Dresses, Tops & Skirts", text: 'Skirts' },
    { section: "Kallah's Side - Dresses, Tops & Skirts", text: 'Shabbos Sheva Brochos Outfits' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'Bandanas (Shabbos, Weekday & Morning)' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'Robes (Shabbos, Weekday & Morning)' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'Hosiery' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'Undergarments' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'Nightgowns (Printed & White)' },
    { section: "Kallah's Side - Lingerie & Sleepwear", text: 'White Tights' },
    { section: "Kallah's Side - Other Essentials", text: 'Scarf' },
    { section: "Kallah's Side - Other Essentials", text: 'Gloves' },
    { section: "Kallah's Side - Other Essentials", text: 'Eyeglasses / Contact Lenses' },
    { section: "Kallah's Side - Other Essentials", text: 'Cosmetics' },
    { section: "Kallah's Side - Other Essentials", text: 'Cosmetic Bag' },
  ],
  'Mechutanim & Family': [
    { section: 'Mechiten', text: 'Clothing' },
    { section: 'Mechiten', text: 'Dry Goods' },
    { section: 'Mechiten', text: 'Shoes' },
    { section: 'Mechiten', text: 'Eyeglasses / Lenses' },
    { section: 'Mechiten', text: 'Shtreimel (Buy / Refresh)' },
    { section: 'Mechteneste', text: 'Mechateneste Dress' },
    { section: 'Mechteneste', text: 'Chasuna Shoes' },
    { section: 'Mechteneste', text: 'Lingerie' },
    { section: 'Mechteneste', text: 'Headgear' },
    { section: 'Mechteneste', text: 'Shoes' },
    { section: 'Mechteneste', text: 'Chasuna Purse' },
    { section: 'Mechteneste', text: 'Sheva Brachos Outfits' },
    { section: 'Mechteneste', text: 'White Tichel' },
    { section: 'Mechteneste', text: 'Eyeglasses / Lenses' },
    { section: 'Mechteneste', text: 'Jewelry (Buy / Polish)' },
    { section: 'Bucherim / Yinglech', text: 'Clothing' },
    { section: 'Bucherim / Yinglech', text: 'Dry Goods' },
    { section: 'Bucherim / Yinglech', text: 'Shoes' },
    { section: 'Bucherim / Yinglech', text: 'Eyeglasses / Lenses' },
    { section: 'Bucherim / Yinglech', text: 'Hat (Buy / Refresh)' },
    { section: 'Meidlech', text: 'Gowns' },
    { section: 'Meidlech', text: 'Lingerie' },
    { section: 'Meidlech', text: 'Shoes' },
    { section: 'Meidlech', text: 'Hair Ornaments' },
    { section: 'Meidlech', text: 'Eyeglasses / Lenses' },
    { section: 'Meidlech', text: 'Jewelry (Buy / Polish)' },
  ],
  'Apartment': [
    { section: 'Apartment', text: 'Finalize the apartment (lease/purchase)' },
    { section: 'Apartment', text: 'Arrange Utilities' },
    { section: 'Apartment', text: 'Fire Insurance' },
    { section: 'Apartment', text: 'Number Lock' },
    { section: 'Apartment', text: 'Smoke Detector' },
    { section: 'Apartment', text: 'Painting / Scraping' },
    { section: 'Apartment', text: 'Light Fixtures / Spotlights' },
    { section: 'Apartment', text: 'Window Shades' },
    { section: 'Apartment', text: 'Mezuzos' },
    { section: 'Furniture', text: 'China Closet / Curio' },
    { section: 'Furniture', text: 'Dinette Set' },
    { section: 'Furniture', text: 'Master Bedroom Set' },
    { section: 'Furniture', text: 'Dining Room Set' },
    { section: 'Furniture', text: 'Bookcase' },
    { section: 'Appliances', text: 'Stove' },
    { section: 'Appliances', text: 'Refrigerator' },
    { section: 'Appliances', text: 'Washer' },
    { section: 'Appliances', text: 'Dryer' },
    { section: 'Appliances', text: 'Vacuum Cleaner' },
    { section: 'Appliances', text: 'Air Conditioner' },
    { section: 'Linen', text: 'Linen (Printed / White)' },
    { section: 'Linen', text: 'Bed Ruffles' },
    { section: 'Linen', text: 'Mattress Covers' },
    { section: 'Linen', text: 'Pillows' },
    { section: 'Linen', text: 'Pillow Protectors' },
    { section: 'Linen', text: 'Quilts / Summer Quilts' },
    { section: 'Linen', text: 'Dish Towels (Milchig / Fleishig)' },
    { section: 'Linen', text: 'Kitchen Towels' },
    { section: 'Linen', text: 'Bath Towels' },
    { section: 'Linen', text: 'Hand Towels' },
    { section: 'Linen', text: 'Shower Curtain & Liner' },
    { section: 'Linen', text: 'Vanity Set' },
    { section: 'Linen', text: 'Bath Mat' },
    { section: 'Linen', text: 'Shabbos Tablecloths' },
    { section: 'Linen', text: 'Kitchen Tablecloths (Shabbos)' },
  ],
  'Shabbos Bavarfen': [
    { section: 'General', text: 'Choose a hosting shul' },
    { section: 'General', text: 'Coordinate with gabbai for aliyah' },
    { section: 'General', text: 'Arrange Shabbos meals — Friday night and Shabbos day' },
    { section: 'General', text: 'Invite family and friends' },
    { section: 'General', text: 'Arrange accommodations for out-of-town guests' },
    { section: 'General', text: 'Arrange Shalosh Seudos' },
    { section: 'General', text: 'Sending to the Kallah: White Tichel / Shirtzel / Siddur / Tehillim' },
    { section: 'General', text: 'Bavarfen Pekelech to Shul & Send to Kallah' },
    { section: "Men's Kiddush", text: 'Arrange Warmer' },
    { section: "Men's Kiddush", text: 'Potato Kugel' },
    { section: "Men's Kiddush", text: 'Lokshen Kugel' },
    { section: "Men's Kiddush", text: 'Cholent' },
    { section: "Men's Kiddush", text: 'Kishka' },
    { section: "Men's Kiddush", text: 'Egg Kichel' },
    { section: "Men's Kiddush", text: 'Herring' },
    { section: "Men's Kiddush", text: 'Gala' },
    { section: "Men's Kiddush", text: 'Liver' },
    { section: "Men's Kiddush", text: 'Cake' },
    { section: "Men's Kiddush", text: 'Grape Juice' },
    { section: "Men's Kiddush", text: 'Liqueur' },
    { section: "Men's Kiddush", text: 'Drinks' },
    { section: "Men's Kiddush", text: 'Napkins / Plates / Cutlery / Cups' },
    { section: "Ladies' Kiddush", text: 'Tablecloths' },
    { section: "Ladies' Kiddush", text: 'Napkins / Plates / Cutlery / Cups' },
    { section: "Ladies' Kiddush", text: 'Grape Juice' },
    { section: "Ladies' Kiddush", text: 'Liqueur' },
    { section: "Ladies' Kiddush", text: 'Drinks' },
    { section: "Ladies' Kiddush", text: 'Cakes / Miniatures' },
    { section: "Ladies' Kiddush", text: 'Salads' },
    { section: "Ladies' Kiddush", text: 'Fruits' },
  ],
  'Before the Wedding': [
    { section: 'Planning & Invitations', text: 'Prepare Invitation List' },
    { section: 'Planning & Invitations', text: 'List Where to Post Invitations (Shuls, Neighborhoods, Local Papers)' },
    { section: 'Planning & Invitations', text: 'Order Name Labels' },
    { section: 'Planning & Invitations', text: 'Prepare Personal Call List' },
    { section: 'Planning & Invitations', text: 'Obtain Marriage License' },
    { section: 'Planning & Invitations', text: 'Arrange Weekday Sheva Brachos' },
    { section: 'Home Preparation', text: 'Complete Any Needed Repairs Around the House' },
    { section: 'Home Preparation', text: 'Set Up Wedding Arches / Decorations' },
    { section: 'Chosson & Kallah Preparation', text: 'Kallah Songs Album' },
    { section: 'Chosson & Kallah Preparation', text: 'Health Checkup' },
    { section: 'Chosson & Kallah Preparation', text: 'Eye Exam / Contact Lenses Exam' },
    { section: 'Chosson & Kallah Preparation', text: 'Dentist Appointment' },
    { section: 'Chosson & Kallah Preparation', text: 'Teeth Whitening' },
    { section: 'Chosson & Kallah Preparation', text: "Perm for the Boys' Payos" },
    { section: 'Chosson & Kallah Preparation', text: 'Take Needed Items to the Cleaners' },
    { section: 'Chosson & Kallah Preparation', text: "Notify the Phone Directory of the Couple's Information" },
    { section: 'Chosson & Kallah Preparation', text: 'Complete All Alterations' },
    { section: 'Chosson & Kallah Preparation', text: 'Toivel the Dishes' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Caterer Menu' },
    { section: 'Wedding Vendors & Arrangements', text: 'Arrange Guests & Hostesses for Shabbos' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Weekday Sheva Brachos' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Photographer' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Florist' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Singer' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Musician' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Hairdresser' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Makeup Artist' },
    { section: 'Wedding Vendors & Arrangements', text: 'Confirm Badchan' },
    { section: 'Wedding Vendors & Arrangements', text: 'Provide Family Information and Details to the Badchan' },
    { section: 'Wedding Vendors & Arrangements', text: 'Arrange Kabolas Ponim Grammen' },
    { section: 'Wedding Vendors & Arrangements', text: 'Arrange Babysitters' },
    { section: 'Wedding Vendors & Arrangements', text: 'Prepare envelopes for vendors (tips and payments)' },
    { section: 'Wedding Ceremony', text: 'Confirm Mesader Kiddushin' },
    { section: 'Wedding Ceremony', text: 'Confirm Eidei Kiddushin' },
    { section: 'Wedding Ceremony', text: 'Arrange Chuppah Announcer / Shamesh' },
    { section: "Kallah's Side", text: 'Laser / Other Hair Removal Treatments' },
    { section: "Chosson's Side", text: 'Prepare ketubah — confirm spelling of names with rav' },
    { section: "Chosson's Side", text: 'Bedikas Tefillin' },
    { section: "Chosson's Side", text: 'Pick Up Shtreimel' },
    { section: "Chosson's Side", text: 'Bring Shtofir to the Apartment (Except What Is Needed for the Wedding)' },
    { section: "Chosson's Side", text: 'Purchase Kiddushin Ring' },
    { section: "Chosson's Side", text: "Order Flowers for the Kallah's Bouquet" },
  ],
  'Wedding (Take to Hall)': [
    { section: 'General', text: 'Tehillim / Techines' },
    { section: 'General', text: 'List of names to have in mind' },
    { section: 'General', text: 'Tzeduka' },
    { section: 'General', text: 'Checks / Credit Card / Cash' },
    { section: 'General', text: 'Tznius Cape or Tichel – Mechitanista' },
    { section: 'General', text: 'Tylenol / Tums' },
    { section: 'General', text: 'Lens Solution / Glasses' },
    { section: 'General', text: 'Camera (charged battery)' },
    { section: 'General', text: 'Cell Phone Charger / Power Bank' },
    { section: 'General', text: 'Rain Bonnets / Hat Covers (if rain predicted)' },
    { section: 'General', text: 'Umbrellas (if rain predicted)' },
    { section: "Kallah's Side", text: 'Deck Tich — White Pins' },
    { section: "Kallah's Side", text: 'Statif Guard' },
    { section: "Kallah's Side", text: 'Pony Rubbers / Bobby Pins' },
    { section: "Kallah's Side", text: 'Gel / Comb / Brush / Hairspray' },
    { section: "Kallah's Side", text: 'White Fur Cape for Chuppah' },
    { section: "Kallah's Side", text: 'Sheitel / Headpiece' },
    { section: "Kallah's Side", text: 'Pouch for Jewelry' },
    { section: "Kallah's Side", text: 'Tide Stick / Peroxide (dress stains)' },
    { section: "Kallah's Side", text: 'Sewing Kit / Scissors / Safety Pins' },
    { section: "Kallah's Side", text: 'Band-Aids / Pads' },
    { section: "Kallah's Side", text: 'Deodorant' },
    { section: "Kallah's Side", text: 'Chosson Kallah Apartment Key' },
    { section: "Chosson's Side", text: 'Kittel' },
    { section: "Chosson's Side", text: 'Hops / Confetti for After Badeken' },
    { section: "Chosson's Side", text: 'Ketubah' },
    { section: "Chosson's Side", text: 'Kiddushin Ring' },
    { section: "Chosson's Side", text: 'Yichud Room Gift' },
    { section: "Chosson's Side", text: 'Extra Set of Clothing for Chosson' },
    { section: "Chosson's Side", text: "Chosson's Tefillin (if not yet by apartment)" },
  ],
  'Vochen Sheva Brachos': [
    'Tables / Chairs / Tablecloths',
    'Dishes / Flatware / Cups / Napkins',
    'Waiters',
    'Grape Juice / Drinks',
    'Bilkas',
    'Dips',
    'Entree',
    'Soup',
    'Main Course',
    '2 Side Dishes',
    'Compote / Ice Cream',
    'Music',
    'Badchan / Bal Darshen',
  ],
  'Shabbos Sheva Brachos': [
    { section: 'Guest Welcome Package', text: 'Welcome poem' },
    { section: 'Guest Welcome Package', text: 'Travel candles & matches' },
    { section: 'Guest Welcome Package', text: 'Cake' },
    { section: 'Guest Welcome Package', text: 'Drinks' },
    { section: 'Guest Welcome Package', text: 'Chocolate, dried fruits, nuts, etc.' },
    { section: 'Guest Welcome Package', text: 'Street map & directions' },
    { section: 'Guest Welcome Package', text: 'סדר הזמנים' },
    { section: 'Guest Welcome Package', text: 'For overseas guests – contact list of: relatives, taxis, hatzolah, chaverim, groceries, restaurants' },
    { section: "טועמי'", text: 'Potato kugel / lokshen kugel / ferfel' },
    { section: "טועמי'", text: 'Drinks' },
    { section: "טועמי'", text: 'Dishes / flatware / cups / napkins' },
    { section: 'סעודות שבת', text: 'Waiters' },
    { section: 'סעודות שבת', text: 'Tables & chairs' },
    { section: 'סעודות שבת', text: 'Tablecloths' },
    { section: 'סעודות שבת', text: 'Dishes / flatware / cups / napkins' },
    { section: 'סעודות שבת', text: 'Challah covers / challah knives' },
    { section: 'סעודות שבת', text: 'Becher' },
    { section: 'סעודות שבת', text: 'Zemiros' },
    { section: 'סעודות שבת', text: 'Grape juice' },
    { section: 'סעודות שבת', text: 'Wine / liqueur' },
    { section: 'סעודות שבת', text: 'Drinks' },
    { section: 'סעודות שבת', text: 'Seltzer' },
    { section: 'סעודות שבת', text: 'Challah' },
    { section: 'סעודות שבת', text: 'Fish' },
    { section: 'סעודות שבת', text: 'Dips' },
    { section: 'סעודות שבת', text: 'Soup' },
    { section: 'סעודות שבת', text: 'Lokshen / kneidel / chick peas' },
    { section: 'סעודות שבת', text: 'Meat / chicken' },
    { section: 'סעודות שבת', text: 'Ferfel / tzimmes' },
    { section: 'סעודות שבת', text: 'Potato kugel' },
    { section: 'סעודות שבת', text: 'Lokshen kugel' },
    { section: 'סעודות שבת', text: 'Eggs & liver' },
    { section: 'סעודות שבת', text: 'Cholent & kishka' },
    { section: 'סעודות שבת', text: 'Compote / ice cream' },
    { section: 'בעל דרשן שלש סעודות – פרויען', text: 'Tablecloths' },
    { section: 'בעל דרשן שלש סעודות – פרויען', text: 'Dishes / flatware / cups / napkins' },
    { section: 'בעל דרשן שלש סעודות – פרויען', text: 'Bilkas' },
    { section: 'בעל דרשן שלש סעודות – פרויען', text: 'Fish / spreads / salads' },
    { section: 'בעל דרשן שלש סעודות – פרויען', text: 'Drinks' },
  ],
  'Housewares': [
    { section: 'General Housewares', text: 'Negel Vaser Sets' },
    { section: 'General Housewares', text: 'Kitchen Washing Cup' },
    { section: 'General Housewares', text: 'Broom & Shovel' },
    { section: 'General Housewares', text: 'Mop & Pail' },
    { section: 'General Housewares', text: 'Laundry Hamper' },
    { section: 'General Housewares', text: 'Laundry Basket' },
    { section: 'General Housewares', text: 'Garbage Can' },
    { section: 'General Housewares', text: 'Door Mat' },
    { section: 'General Housewares', text: 'Organizing Baskets' },
    { section: 'General Housewares', text: 'Wicker Baskets' },
    { section: 'General Housewares', text: 'Hooks' },
    { section: 'General Housewares', text: 'Iron & Ironing Board' },
    { section: 'General Housewares', text: 'Hangers - regular, skirt & coat' },
    { section: 'General Housewares', text: 'Mirror - full length' },
    { section: 'General Housewares', text: 'Hand Mirror' },
    { section: 'General Housewares', text: 'Hair Clipper' },
    { section: 'General Housewares', text: 'Alarm Clock' },
    { section: 'General Housewares', text: 'Toilet Brush & Plunger' },
    { section: 'General Housewares', text: 'Shabbos Lamp' },
    { section: 'General Housewares', text: 'Flashlight' },
    { section: 'General Housewares', text: 'Umbrellas' },
    { section: 'General Housewares', text: 'Suitcases' },
    { section: 'General Housewares', text: 'Batteries' },
    { section: 'General Housewares', text: 'Sewing Box & Supplies' },
    { section: 'General Housewares', text: 'Step Stool' },
    { section: 'General Housewares', text: 'Pens / Pencils / Note Pads' },
    { section: 'General Housewares', text: 'Scotch Tape' },
    { section: 'General Housewares', text: 'Telephone Book' },
    { section: 'General Housewares', text: 'Scissors' },
    { section: 'General Housewares', text: 'Envelopes' },
    { section: 'General Housewares', text: 'Cellphone Chargers' },
    { section: 'General Housewares', text: 'Can Opener' },
    { section: 'General Housewares', text: 'Sugar Holder' },
    { section: 'General Housewares', text: 'Pitcher & Drinking Glasses' },
    { section: 'General Housewares', text: 'Havdalah Glass' },
    { section: 'General Housewares', text: 'Cosmetic Bag' },
    { section: 'General Housewares', text: 'Shoe Brush' },
    { section: 'Kitchen Appliances', text: 'Percolator / Tea Kettle / Thermos' },
    { section: 'Kitchen Appliances', text: 'Toaster Oven / Sandwich Maker' },
    { section: 'Kitchen Appliances', text: 'Betty Crocker' },
    { section: 'Kitchen Appliances', text: 'Food Processor' },
    { section: 'Kitchen Appliances', text: 'Hand Blender' },
    { section: 'Kitchen Appliances', text: 'Hot Plate' },
    { section: 'Kitchen Items', text: 'Colander' },
    { section: 'Kitchen Items', text: 'Serving Tray' },
    { section: 'Kitchen Items', text: 'Cloth Napkins & Rings' },
    { section: 'Kitchen Items', text: 'Napkin Holder' },
    { section: 'Kitchen Items', text: 'Kitchen Clock' },
    { section: 'Kitchen Items', text: 'Small Rags' },
    { section: 'Kitchen Items', text: 'Containers for Pantry' },
    { section: 'Kitchen Items', text: 'Grater' },
    { section: 'Kitchen Items', text: 'Knife Sharpener' },
    { section: 'Kitchen Items', text: 'Flour Sifter' },
    { section: 'Kitchen Items', text: 'Recipe Book' },
    { section: 'Kitchen Items', text: 'Baking Pans' },
    { section: 'Kitchen Items', text: 'Oven Mitts & Apron' },
    { section: 'Kitchen Items', text: 'Spatula' },
    { section: 'Kitchen Items', text: 'Pastry Brush' },
    { section: 'Kitchen Items', text: 'Rolling Pin' },
    { section: 'Kitchen Items', text: 'Measuring Cups & Spoons' },
    { section: 'Separate Milchig & Fleishig', text: 'Pots' },
    { section: 'Separate Milchig & Fleishig', text: 'Dishes' },
    { section: 'Separate Milchig & Fleishig', text: 'Serving Utensils' },
    { section: 'Separate Milchig & Fleishig', text: 'Knives & Peelers' },
    { section: 'Separate Milchig & Fleishig', text: 'Ice Cream Scoop' },
    { section: 'Separate Milchig & Fleishig', text: 'Cutlery' },
    { section: 'Separate Milchig & Fleishig', text: 'Cutlery Organizer' },
    { section: 'Separate Milchig & Fleishig', text: 'Dish Drainers' },
    { section: 'Separate Milchig & Fleishig', text: 'Mixing Bowls' },
    { section: 'Separate Milchig & Fleishig', text: 'Tablecloths' },
    { section: 'Separate Milchig & Fleishig', text: 'Placemats' },
    { section: 'Separate Milchig & Fleishig', text: 'Cutting Boards' },
    { section: 'Separate Milchig & Fleishig', text: 'Salt & Pepper Shakers' },
  ],
  'Grocery': [
    { section: 'Food & Pantry', text: 'Farina / Oatmeal' },
    { section: 'Food & Pantry', text: 'Tuna' },
    { section: 'Food & Pantry', text: 'Mayonnaise' },
    { section: 'Food & Pantry', text: 'Ketchup' },
    { section: 'Food & Pantry', text: 'Peanut Butter' },
    { section: 'Food & Pantry', text: 'Jam' },
    { section: 'Food & Pantry', text: 'Crackers' },
    { section: 'Food & Pantry', text: 'Cookies' },
    { section: 'Food & Pantry', text: 'Bread / Rolls / Bagels' },
    { section: 'Food & Pantry', text: 'Ices / Ice Cream' },
    { section: 'Food & Pantry', text: 'Chocolates / Nosh / Nuts / Chips' },
    { section: 'Food & Pantry', text: 'Grape Juice' },
    { section: 'Food & Pantry', text: 'Spring Water / Seltzer' },
    { section: 'Food & Pantry', text: 'Coffee / Tea' },
    { section: 'Food & Pantry', text: 'Sugar' },
    { section: 'Food & Pantry', text: 'Salt / Spices' },
    { section: 'Food & Pantry', text: 'Cereals' },
    { section: 'Food & Pantry', text: 'Oil' },
    { section: 'Food & Pantry', text: 'Fruit & Vegetables' },
    { section: 'Food & Pantry', text: 'Milk / Juice' },
    { section: 'Food & Pantry', text: 'Dairy Products' },
    { section: 'Food & Pantry', text: 'Eggs' },
    { section: 'Shabbos & Yom Tov', text: 'Candles / Candle Holders' },
    { section: 'Shabbos & Yom Tov', text: 'Oil Wicks / Oil Glasses / Olive Oil' },
    { section: 'Shabbos & Yom Tov', text: 'Travel Candles' },
    { section: 'Shabbos & Yom Tov', text: 'Besumim / Havdalah' },
    { section: 'Shabbos & Yom Tov', text: 'Matches' },
    { section: 'Disposables & Paper Goods', text: 'Disposable Cups' },
    { section: 'Disposables & Paper Goods', text: 'Disposable Plates / Cutlery' },
    { section: 'Disposables & Paper Goods', text: 'Napkins / Towel Paper' },
    { section: 'Disposables & Paper Goods', text: 'Silver Foil' },
    { section: 'Disposables & Paper Goods', text: 'Garbage Bags' },
    { section: 'Disposables & Paper Goods', text: 'Toothpicks' },
    { section: 'Disposables & Paper Goods', text: 'Baking Paper' },
    { section: 'Disposables & Paper Goods', text: 'Saran Wrap' },
    { section: 'Disposables & Paper Goods', text: 'Plastic Tablecloth' },
    { section: 'Disposables & Paper Goods', text: 'Sandwich Bags / Freezer Bags' },
    { section: 'Household', text: 'Silver Polish' },
    { section: 'Household', text: 'Shoe Polish' },
    { section: 'Household', text: 'Lens Solution' },
    { section: 'Household', text: 'Calendar / Zman Tsetl' },
    { section: 'Cleaning Supplies', text: 'Dishwashing Lotion / Cleanser' },
    { section: 'Cleaning Supplies', text: 'Steel Wool / Sponges' },
    { section: 'Cleaning Supplies', text: 'Laundry Detergent' },
    { section: 'Cleaning Supplies', text: 'Fabric Softener' },
    { section: 'Cleaning Supplies', text: 'Bleach' },
    { section: 'Cleaning Supplies', text: 'Pretreater' },
    { section: 'Cleaning Supplies', text: 'Spray Starch' },
    { section: 'Cleaning Supplies', text: 'Static Guard' },
    { section: 'Cleaning Supplies', text: 'Closet Freshener' },
    { section: 'Cleaning Supplies', text: 'Mr. Clean' },
    { section: 'Cleaning Supplies', text: 'Windex' },
    { section: 'Cleaning Supplies', text: 'Clorox Wipes' },
    { section: 'Cleaning Supplies', text: 'Soft Scrub' },
    { section: 'Cleaning Supplies', text: 'Oven Cleaner' },
    { section: 'Cleaning Supplies', text: 'Flushable Wipes' },
    { section: 'Toiletries & Health', text: 'Tissues' },
    { section: 'Toiletries & Health', text: 'Pre Cut Toilet Paper' },
    { section: 'Toiletries & Health', text: 'Disposable Gloves' },
    { section: 'Toiletries & Health', text: 'Thermometer' },
    { section: 'Toiletries & Health', text: 'Pain Killers' },
    { section: 'Toiletries & Health', text: 'Tums' },
    { section: 'Toiletries & Health', text: 'Band-Aids' },
    { section: 'Toiletries & Health', text: 'Bactroban' },
    { section: 'Toiletries & Health', text: 'Peroxide / Alcohol' },
    { section: 'Toiletries & Health', text: 'Mouthwash / Dental Floss' },
    { section: 'Toiletries & Health', text: 'Toothbrushes' },
    { section: 'Toiletries & Health', text: 'Toothpaste' },
    { section: 'Toiletries & Health', text: 'Nail Clipper' },
    { section: 'Toiletries & Health', text: 'Tweezers' },
    { section: 'Toiletries & Health', text: 'Pads' },
    { section: 'Toiletries & Health', text: 'Deodorant' },
    { section: 'Toiletries & Health', text: 'Make Up Remover' },
    { section: 'Toiletries & Health', text: 'Moisturizer' },
    { section: 'Toiletries & Health', text: 'Body Lotion / Hand Lotion' },
    { section: 'Toiletries & Health', text: 'Hand Soap' },
    { section: 'Toiletries & Health', text: 'Body Wash / Shampoo' },
    { section: 'Toiletries & Health', text: 'Cotton Balls / Q-Tips' },
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
  'Vochen Sheva Brachos': '🎉 Vochen Sheva Brachos',
  'Shabbos Sheva Brachos': '🕯️ Shabbos Sheva Brachos',
  'Housewares': '🛋️ Housewares',
  'Grocery': '🛒 Grocery',
}

// Plain-text labels (no emoji) for a cleaner printed PDF title
const CHECKLIST_PDF_TITLES = {
  'Lchaim': "L'chaim Checklist",
  'Tnaim': 'Tnaim Checklist',
  'After Shidduch': 'After the Shidduch Checklist',
  'Traditional Gifts': 'Traditional Gifts Checklist',
  'Chosson & Kallah Clothing': 'Chosson & Kallah Clothing Checklist',
  'Mechutanim & Family': 'Mechutanim & Family Checklist',
  'Apartment': 'Apartment Checklist',
  'Shabbos Bavarfen': 'Shabbos Bavarfen Checklist',
  'Before the Wedding': 'Before the Wedding Checklist',
  'Wedding (Take to Hall)': 'Wedding Checklist',
  'Vochen Sheva Brachos': 'Vochen Sheva Brachos Checklist',
  'Shabbos Sheva Brachos': 'Shabbos Sheva Brachos Checklist',
  'Housewares': 'Housewares Checklist',
  'Grocery': 'Grocery Checklist',
}

function ExportPageContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listKey, setListKey] = useState(null)
  const [listItems, setListItems] = useState([])
  const [weddingInfo, setWeddingInfo] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const init = async () => {
      const requestedList = searchParams.get('list')

      if (!requestedList || !CHECKLISTS[requestedList]) {
        setError('No valid checklist was specified.')
        setLoading(false)
        return
      }
      setListKey(requestedList)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const status = await getAccessStatus(user)
      if (!status.hasDataAccess) {
        router.push('/checklist')
        return
      }

      // Wedding info — Side B pulls from the owner's row
      const weddingOwnerId = status.isSideB ? status.ownerUserId : user.id
      const { data: wedding } = await supabase
        .from('weddings')
        .select('*')
        .eq('side_a_user_id', weddingOwnerId)
        .maybeSingle()
      setWeddingInfo(wedding || null)

      // Load saved checklist state for this user
      const { data: rows } = await supabase
        .from('checklist_v2')
        .select('*')
        .eq('user_id', user.id)
        .eq('list_key', requestedList)

      const savedMap = {}
      ;(rows || []).forEach(r => { savedMap[r.item_text] = r })

      const defaultItems = CHECKLISTS[requestedList].map(entry => {
        const text = typeof entry === 'string' ? entry : entry.text
        const section = typeof entry === 'string' ? null : entry.section
        const s = savedMap[text]
        return {
          text,
          section,
          checked: s ? s.checked : false,
          removed: s ? s.removed : false,
          isCustom: false,
        }
      })

      const customItems = (rows || []).filter(r => r.is_custom).map(r => ({
        text: r.item_text,
        section: null,
        checked: r.checked,
        removed: r.removed,
        isCustom: true,
      }))

      const combined = [...defaultItems, ...customItems].filter(i => !i.removed)
      setListItems(combined)
      setLoading(false)
    }
    init()
  }, [])

  const exportToPDF = () => {
    const unchecked = listItems.filter(i => !i.checked)
    const checked = listItems.filter(i => i.checked)

    const weddingDateDisplay = weddingInfo?.wedding_date
      ? new Date(weddingInfo.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''

    const renderItemRow = (item) => `
      <div class="item-row ${item.checked ? 'item-checked' : ''}">
        <span class="item-box">${item.checked ? '✓' : ''}</span>
        <span class="item-text">${item.text}${item.isCustom ? ' <span class="custom-tag">(custom)</span>' : ''}</span>
      </div>
    `

    const renderSectioned = (list) => {
      const groups = []
      let lastSection = undefined
      list.forEach(item => {
        if (item.section !== lastSection) {
          groups.push({ section: item.section, items: [] })
          lastSection = item.section
        }
        groups[groups.length - 1].items.push(item)
      })
      return groups.map(g => `
        ${g.section ? `<div class="section-header">${g.section}</div>` : ''}
        ${g.items.map(renderItemRow).join('')}
      `).join('')
    }

    const printWindow = window.open('', '_blank')
    const pdfTitle = CHECKLIST_PDF_TITLES[listKey] || `${listKey} Checklist`
    const html = `
      <html><head>
        <title>SimchaPro ${pdfTitle}</title>
        <style>
        @page { size: portrait; margin: 0.5in; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
          .logo-bar { text-align: center; padding: 20px 0 10px; border-bottom: 3px solid #1a3c8f; margin-bottom: 10px; }
          .logo-text { font-size: 32px; font-weight: 800; color: #1a3c8f; letter-spacing: -0.5px; }
          .logo-tagline { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
          h1 { color: #1a3c8f; text-align: center; margin: 15px 0 5px; font-size: 22px; }
          .subtitle { text-align: center; color: #666; margin: 3px 0; }
          .wedding-name { text-align: center; font-size: 18px; font-weight: bold; color: #1a3c8f; margin: 8px 0 0; }
          .wedding-date { text-align: center; font-size: 13px; color: #888; margin: 2px 0 10px; }
          .progress-box { background: #f0f4ff; padding: 12px 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 13px; color: #444; }
          .progress-box strong { color: #1a3c8f; }
          .section-header { font-size: 11px; font-weight: bold; color: #1a3c8f; text-transform: uppercase; letter-spacing: 0.5px; background: #e8edf8; padding: 6px 12px; margin-top: 14px; border-radius: 4px; }
          .item-row { display: flex; align-items: flex-start; gap: 10px; padding: 7px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .item-box { flex-shrink: 0; width: 16px; height: 16px; border: 2px solid #1a3c8f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; margin-top: 1px; }
          .item-checked .item-box { background: #1a3c8f; }
          .item-checked .item-text { color: #999; text-decoration: line-through; }
          .custom-tag { color: #4a7fd6; font-size: 11px; font-style: italic; }
          .section-divider { margin-top: 20px; border-top: 2px solid #ddd; padding-top: 4px; }
          .print-btn { position: fixed; top: 20px; right: 20px; background: #1a3c8f; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head><body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <div class="logo-bar">
          <div class="logo-text">SimchaPro</div>
          <div class="logo-tagline">Simcha Planning Made Simple</div>
        </div>
        <h1>${pdfTitle}</h1>
        ${weddingInfo?.wedding_name ? `<p class="wedding-name">${weddingInfo.wedding_name}</p>` : ''}
        ${weddingDateDisplay ? `<p class="wedding-date">📅 ${weddingDateDisplay}</p>` : ''}
        <p class="subtitle">Generated: ${new Date().toLocaleDateString()}</p>
        <div class="progress-box">
          <strong>${checked.length}</strong> of <strong>${listItems.length}</strong> items completed
        </div>
        ${renderSectioned(unchecked)}
        ${checked.length > 0 ? `<div class="section-divider"></div>${renderSectioned(checked)}` : ''}
      </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-blue-900">
        <p>{error}</p>
        <button onClick={() => router.push('/checklist')} className="bg-blue-900 text-white px-5 py-2 rounded-lg font-semibold">
          Back to Checklist
        </button>
      </div>
    )
  }

  const checkedCount = listItems.filter(i => i.checked).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => router.push('/checklist')}>← Back to Checklist</h1>
        <button
          onClick={exportToPDF}
          className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300"
        >
          📄 Download PDF
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-1">{CHECKLIST_LABELS[listKey]}</h2>
          {weddingInfo?.wedding_name && <p className="text-gray-500 text-sm">{weddingInfo.wedding_name}</p>}
          <p className="text-sm text-gray-400 mt-2">{checkedCount} of {listItems.length} items completed</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="divide-y">
            {listItems.map((item, idx) => (
              <div key={idx} className={`px-6 py-3 flex items-start gap-3 ${item.checked ? 'bg-gray-50' : ''}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${item.checked ? 'bg-blue-900 border-blue-900' : 'border-gray-300'}`}>
                  {item.checked && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.text}
                  {item.isCustom && <span className="ml-2 text-xs text-blue-400">custom</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Click "Download PDF" above to generate a branded, printable version of this checklist.
        </p>
      </div>
    </div>
  )
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>}>
      <ExportPageContent />
    </Suspense>
  )
}