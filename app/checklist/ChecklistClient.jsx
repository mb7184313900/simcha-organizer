'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAccessStatus } from '../../lib/accessControl'
import Footer from '../../components/Footer'
import Header from '../../components/Header'

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
const CHECKLIST_NOTES = {
  'Traditional Gifts': 'This is a general list and includes some items that are not standard in every family or community.',
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

export default function ChecklistClient() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const [weddingId, setWeddingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeList, setActiveList] = useState('Lchaim')
  const [items, setItems] = useState({})
  const [newItemText, setNewItemText] = useState('')
  const [dateInputs, setDateInputs] = useState({})
  const [showRemoved, setShowRemoved] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const router = useRouter()

  const canEdit = access?.canEdit || false
  const hasDataAccess = access?.hasDataAccess || false

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const initial = {}
        Object.keys(CHECKLISTS).forEach(k => {
          initial[k] = CHECKLISTS[k].map(entry => {
            const text = typeof entry === 'string' ? entry : entry.text
            const section = typeof entry === 'string' ? null : entry.section
            return { text, section, checked: false, removed: false, date: null, isCustom: false }
          })
        })
        setItems(initial)
        setLoading(false)
        return
      }

      setUser(user)

      const status = await getAccessStatus(user)
      setAccess(status)
      setWeddingId(status.weddingId)

      if (status.hasDataAccess && status.weddingId) {
        await loadUserData(user.id, status.weddingId)
      } else {
        const initial = {}
        Object.keys(CHECKLISTS).forEach(k => {
          initial[k] = CHECKLISTS[k].map(entry => {
            const text = typeof entry === 'string' ? entry : entry.text
            const section = typeof entry === 'string' ? null : entry.section
            return { text, section, checked: false, removed: false, date: null, isCustom: false }
          })
        })
        setItems(initial)
      }

      setLoading(false)
    }
    init()
  }, [])

  const loadUserData = async (userId, wId) => {
    const { data: rows } = await supabase
      .from('checklist_v2')
      .select('*')
      .eq('user_id', userId)
      .eq('wedding_id', wId)

    const built = {}
    Object.keys(CHECKLISTS).forEach(listKey => {
      const saved = rows?.filter(r => r.list_key === listKey) || []
      const savedMap = {}
      saved.forEach(r => { savedMap[r.item_text] = r })

      const defaultItems = CHECKLISTS[listKey].map(entry => {
        const text = typeof entry === 'string' ? entry : entry.text
        const section = typeof entry === 'string' ? null : entry.section
        const s = savedMap[text]
        return {
          text,
          section,
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
    if (!user || !weddingId) return
    const { data: existing } = await supabase
      .from('checklist_v2')
      .select('id')
      .eq('user_id', user.id)
      .eq('wedding_id', weddingId)
      .eq('list_key', listKey)
      .eq('item_text', itemText)
      .single()

    if (existing) {
      await supabase.from('checklist_v2').update(updates).eq('id', existing.id)
    } else {
      await supabase.from('checklist_v2').insert({
        user_id: user.id,
        wedding_id: weddingId,
        list_key: listKey,
        item_text: itemText,
        ...updates,
      })
    }
  }

  const toggleCheck = async (listKey, itemText) => {
    if (!canEdit) return
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
    if (!canEdit) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, removed: true } : i
      )
      return { ...prev, [listKey]: updated }
    })
    await saveItem(listKey, itemText, { removed: true })
  }

  const addBackItem = async (listKey, itemText) => {
    if (!canEdit) return
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        i.text === itemText ? { ...i, removed: false } : i
      )
      return { ...prev, [listKey]: updated }
    })
    await saveItem(listKey, itemText, { removed: false })
  }
  const removeSection = async (listKey, sectionNames) => {
    if (!canEdit) return
    const itemsToRemove = (items[listKey] || []).filter(i => sectionNames.includes(i.section) && !i.removed)
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        sectionNames.includes(i.section) ? { ...i, removed: true } : i
      )
      return { ...prev, [listKey]: updated }
    })
    for (const item of itemsToRemove) {
      await saveItem(listKey, item.text, { removed: true })
    }
  }

  const addBackSection = async (listKey, sectionNames) => {
    if (!canEdit) return
    const itemsToRestore = (items[listKey] || []).filter(i => sectionNames.includes(i.section) && i.removed)
    setItems(prev => {
      const updated = prev[listKey].map(i =>
        sectionNames.includes(i.section) ? { ...i, removed: false } : i
      )
      return { ...prev, [listKey]: updated }
    })
    for (const item of itemsToRestore) {
      await saveItem(listKey, item.text, { removed: false })
    }
  }

  const addCustomItem = async () => {
    if (!canEdit || !newItemText.trim() || !weddingId) return
    const text = newItemText.trim()
    setItems(prev => ({
      ...prev,
      [activeList]: [...(prev[activeList] || []), { text, checked: false, removed: false, date: null, isCustom: true }]
    }))
    setNewItemText('')
    await supabase.from('checklist_v2').insert({
      user_id: user.id,
      wedding_id: weddingId,
      list_key: activeList,
      item_text: text,
      checked: false,
      removed: false,
      is_custom: true,
      item_date: null,
    })
  }

  const setItemDate = async (listKey, itemText, date) => {
    if (!canEdit) return
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
    const target = new Date(dateStr + 'T00:00:00')
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
      <Header user={user} onDashboardClick={() => router.push('/dashboard')} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>Simcha Checklist 📋</span>
          <a
            href="/help#checklist"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get help with the Simcha Checklist"
            title="Get help with the Simcha Checklist"
            className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-[#C9A227] text-[#141d33] text-sm font-bold leading-none hover:opacity-80 hover:scale-110 transition-all"
          >
            ?
          </a>
        </h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-xl">
          Planning a wedding can be overwhelming. We've gathered practical checklists, traditional customs, and planning guides to help keep everything organized from the Shidduch through the Sheva Brachos.
        </p>

{showHowItWorks && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowHowItWorks(false)}>
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
      <h3 className="text-xl font-bold text-blue-900 mb-4">How the Checklist Works</h3>
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex gap-3"><span className="text-blue-900 font-bold">📅</span><span><strong>Set a date</strong> on any item — items with dates float to the top, sorted by closest date first, with a countdown showing how many days away.</span></li>
        <li className="flex gap-3"><span className="text-blue-900 font-bold">✓</span><span><strong>Check off items</strong> as you complete them — checked items move to the bottom of the list so you can focus on what's left.</span></li>
        <li className="flex gap-3"><span className="text-blue-900 font-bold">🗑️</span><span><strong>Remove items</strong> that don't apply to you — they move to a hidden section at the bottom where you can add them back anytime.</span></li>
        <li className="flex gap-3"><span className="text-blue-900 font-bold">➕</span><span><strong>Add your own items</strong> to any checklist using the input at the bottom of each list.</span></li>
        <li className="flex gap-3"><span className="text-blue-900 font-bold">📄</span><span><strong>Export</strong> any combination of checklists to a printable PDF — choose which lists to include and print or save.</span></li>
      </ul>
      <button onClick={() => setShowHowItWorks(false)} className="mt-6 w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800">Got It</button>
    </div>
  </div>
)}
        {!hasDataAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">You're viewing a preview</p>
              <p className="text-yellow-700 text-sm">Sign up to check off items, add custom tasks, set dates, and export to PDF.</p>
            </div>
            <a href="/signup" className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center">
              Start Free Trial
            </a>
          </div>
        )}

        {(access?.state === 'expired' || access?.state === 'trial_expired') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">
                ⏰ {access.state === 'trial_expired'
                  ? (access.isSideB ? 'Free trial has ended' : 'Your free trial has ended')
                  : (access.isSideB ? 'Edit access has expired' : 'Your edit access has expired')}
              </p>
              <p className="text-yellow-700 text-sm">
                {access.state === 'trial_expired'
                  ? (access.isSideB
                      ? "The wedding owner's free trial has ended. Ask them to activate to make changes again."
                      : "You're viewing this checklist in read-only mode. Activate for $99 to add, edit, and check off items.")
                  : (access.isSideB
                      ? "You're viewing this checklist in read-only mode. Ask the wedding owner to renew to make changes again."
                      : "You're viewing this checklist in read-only mode. Renew to check off items, add tasks, and more.")}
              </p>
            </div>
            {!access.isSideB && (
              <a
                href={access.state === 'trial_expired' ? '/pricing' : '/renew'}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center"
              >
                {access.state === 'trial_expired' ? 'Activate for $99' : 'Renew Now'}
              </a>
            )}
          </div>
        )}

        {access?.state === 'revoked' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="font-semibold text-red-700">⚠️ Your shared access has been revoked</p>
            <p className="text-red-600 text-sm">The other family has revoked your shared access. You can still view your own checklist below, but cannot add or edit anything.</p>
          </div>
        )}

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

        {CHECKLIST_NOTES[activeList] && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
            ℹ️ {CHECKLIST_NOTES[activeList]}
          </div>
        )}

        <div key={activeList} className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50">
  <h3 className="font-bold text-blue-900 text-lg">{CHECKLIST_LABELS[activeList]}</h3>
  {hasDataAccess && (
    <div className="flex items-center gap-2">
      <button onClick={() => setShowHowItWorks(true)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100 font-semibold">
        How it works
      </button>
      <button onClick={() => router.push(`/checklist/export?list=${encodeURIComponent(activeList)}`)} className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 font-semibold">
        Export ↓
      </button>
    </div>
  )}
</div>

          {hasDataAccess && withDate.length > 0 && (
            <div className="divide-y border-b">
              {withDate.map(item => {
                const days = getDaysUntil(item.date)
                return (
                  <ItemRow
                    key={item.text}
                    item={item}
                    canEdit={canEdit}
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

           <div className="divide-y">
            {(() => {
              let lastSection = undefined
              let lastTopSectionShown = undefined
              return unchecked.map(item => {
                const showHeader = item.section && item.section !== lastSection
                lastSection = item.section
                let showSideButton = null
                if (showHeader) {
                  const topSection = item.section.startsWith("Chosson's Side") && item.section !== "Chosson's Side" ? "Chosson's Side"
                    : item.section.startsWith("Kallah's Side") && item.section !== "Kallah's Side" ? "Kallah's Side"
                    : null
                  if (topSection && topSection !== lastTopSectionShown) {
                    showSideButton = topSection
                    lastTopSectionShown = topSection
                  }
                }
                return (
                  <div key={item.text}>
                   {showHeader && (
                      <div className="px-6 pt-4 pb-1 bg-gray-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">{item.section}</span>
                          {canEdit && (item.section === "Kallah's Side" || item.section === "Chosson's Side" ? (
                          <button
                            onClick={() => {
                              const sections = (item.section === "Chosson's Side" && activeList === 'Lchaim')
                                ? ["Chosson's Side", "First Shabbos After the L'chaim"]
                                : [item.section]
                              removeSection(activeList, sections)
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap"
                          >
                            Remove entire section
                          </button>
                       ) : showSideButton === "Chosson's Side" ? (
                          <button
                            onClick={() => {
                              const sections = (items[activeList] || [])
                                .map(i => i.section)
                                .filter(s => s && s.startsWith("Chosson's Side"))
                              removeSection(activeList, [...new Set(sections)])
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap"
                          >
                            Remove entire Chosson's Side
                          </button>
                        ) : showSideButton === "Kallah's Side" ? (
                          <button
                            onClick={() => {
                              const sections = (items[activeList] || [])
                                .map(i => i.section)
                                .filter(s => s && s.startsWith("Kallah's Side"))
                              removeSection(activeList, [...new Set(sections)])
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap"
                          >
                            Remove entire Kallah's Side
                          </button>
                        ) : null)}
                      </div>
                    )}
                    <ItemRow
                      item={item}
                      canEdit={canEdit}
                      days={null}
                      onToggle={() => toggleCheck(activeList, item.text)}
                      onRemove={() => removeItem(activeList, item.text)}
                      onSetDate={(d) => setItemDate(activeList, item.text, d)}
                      dateInputs={dateInputs}
                      setDateInputs={setDateInputs}
                    />
                  </div>
                )
              })
            })()}
          </div>

          {hasDataAccess && checked.length > 0 && (
            <div className="divide-y border-t bg-gray-50">
              {checked.map(item => (
                <ItemRow
                  key={item.text}
                  item={item}
                  canEdit={canEdit}
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

          {canEdit && (
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

        {canEdit && removedList.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowRemoved(v => !v)}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              {showRemoved ? 'Hide' : 'Show'} removed items ({removedList.length})
            </button>
            {showRemoved && (
              <div className="mt-3 bg-white rounded-xl border divide-y shadow-sm">
                 {(() => {
                  const removedSections = [...new Set(removedList.map(i => i.section).filter(Boolean))]
                  const buttons = []

                  removedSections
                    .filter(s => (s === "Kallah's Side" || s === "Chosson's Side"))
                    .filter(s => (items[activeList] || []).every(i => i.section !== s || i.removed))
                    .forEach(section => {
                      buttons.push(
                        <div key={section} className="flex items-center justify-between px-6 py-3 gap-4 bg-blue-50">
                          <span className="text-sm font-semibold text-blue-900">{section} (entire section removed)</span>
                          <button
                            onClick={() => {
                              const sections = (section === "Chosson's Side" && activeList === 'Lchaim')
                                ? ["Chosson's Side", "First Shabbos After the L'chaim"]
                                : [section]
                              addBackSection(activeList, sections)
                            }}
                            className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 font-semibold whitespace-nowrap"
                          >
                            Add back entire section
                          </button>
                        </div>
                      )
                    })

                  const allSubSections = [...new Set((items[activeList] || []).map(i => i.section).filter(Boolean))]
                  const chossonSubs = allSubSections.filter(s => s.startsWith("Chosson's Side -"))
                  const kallahSubs = allSubSections.filter(s => s.startsWith("Kallah's Side -"))

                  if (chossonSubs.length > 0 && chossonSubs.every(s => (items[activeList] || []).every(i => i.section !== s || i.removed))) {
                    buttons.push(
                      <div key="chosson-side-all" className="flex items-center justify-between px-6 py-3 gap-4 bg-blue-50">
                        <span className="text-sm font-semibold text-blue-900">Chosson's Side (entire side removed)</span>
                        <button
                          onClick={() => addBackSection(activeList, chossonSubs)}
                          className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 font-semibold whitespace-nowrap"
                        >
                          Add back entire Chosson's Side
                        </button>
                      </div>
                    )
                  }

                  if (kallahSubs.length > 0 && kallahSubs.every(s => (items[activeList] || []).every(i => i.section !== s || i.removed))) {
                    buttons.push(
                      <div key="kallah-side-all" className="flex items-center justify-between px-6 py-3 gap-4 bg-blue-50">
                        <span className="text-sm font-semibold text-blue-900">Kallah's Side (entire side removed)</span>
                        <button
                          onClick={() => addBackSection(activeList, kallahSubs)}
                          className="text-xs text-blue-700 border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 font-semibold whitespace-nowrap"
                        >
                          Add back entire Kallah's Side
                        </button>
                      </div>
                    )
                  }

                  return buttons
                })()}
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
      <Footer />
    </div>
  )
}

function ItemRow({ item, canEdit, days, onToggle, onRemove, onSetDate, dateInputs, setDateInputs, highlight }) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <div className={`flex items-start gap-3 px-6 py-4 group ${highlight ? 'bg-blue-50' : ''} ${item.checked ? 'opacity-60' : ''}`}>
      <button
        onClick={canEdit ? onToggle : undefined}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          item.checked
            ? 'bg-blue-900 border-blue-900'
            : canEdit
              ? 'border-gray-300 hover:border-blue-500 cursor-pointer'
              : 'border-gray-200 cursor-default'
        }`}
      >
        {item.checked && <span className="text-white text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {item.text}
          {item.isCustom && <span className="ml-2 text-xs text-blue-400 font-medium">custom</span>}
        </span>

        {item.date && !item.checked && (
  <div className="mt-1 flex items-center gap-2">
    <span
      onClick={() => canEdit && setShowDatePicker(v => !v)}
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${canEdit ? 'cursor-pointer hover:opacity-75' : ''} ${
        days === 0 ? 'bg-red-100 text-red-700' :
        days < 0 ? 'bg-gray-100 text-gray-500' :
        days <= 7 ? 'bg-orange-100 text-orange-700' :
        'bg-blue-100 text-blue-700'
      }`}
      title={canEdit ? 'Click to edit date' : undefined}
    >
      {days === 0 ? 'Today!' : days < 0 ? `${Math.abs(days)}d ago` : `${days} day${days === 1 ? '' : 's'} away`}
    </span>
    <span className="text-xs text-gray-400">{new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
    {canEdit && (
      <button onClick={() => onSetDate(null)} className="text-xs text-gray-300 hover:text-red-400">✕</button>
    )}
  </div>
)}

        {canEdit && showDatePicker && (
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

      {canEdit && !item.checked && (
  <div className="flex items-center gap-2 flex-shrink-0">
    <button
      onClick={() => setShowDatePicker(v => !v)}
      className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 px-2 py-0.5 rounded-full"
      title={item.date ? 'Edit date' : 'Set date'}
    >
      📅
    </button>
          <button
  onClick={onRemove}
  className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap"
  title="Remove from list"
>
  Remove from list
</button>
        </div>
      )}
    </div>
  )
}