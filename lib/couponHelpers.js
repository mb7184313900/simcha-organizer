function isExpired(expiration) {
  if (!expiration) return false
  return new Date(`${expiration}T23:59:59`).getTime() < Date.now()
}

// type is 'regular' or 'exclusive'
export function hasActiveCoupon(vendor, type) {
  const percentOff = vendor[`${type}_coupon_percent_off`]
  const dollarOff = vendor[`${type}_coupon_dollar_off`]
  const specialOffer = vendor[`${type}_coupon_special_offer`]
  const expiration = vendor[`${type}_coupon_expiration`]

  const hasAnyOffer = percentOff != null || dollarOff != null || Boolean(specialOffer)
  if (!hasAnyOffer) return false

  return !isExpired(expiration)
}

export function formatCouponText(vendor, type) {
  const percentOff = vendor[`${type}_coupon_percent_off`]
  const dollarOff = vendor[`${type}_coupon_dollar_off`]
  const specialOffer = vendor[`${type}_coupon_special_offer`]
  const terms = vendor[`${type}_coupon_terms`]
  const code = vendor[`${type}_coupon_code`]

  const amountParts = []
  if (percentOff != null) amountParts.push(`${percentOff}% off`)
  if (dollarOff != null) amountParts.push(`$${dollarOff} off`)

  let text = amountParts.join(', ')

  if (specialOffer) {
    text = text ? `${text} — ${specialOffer}` : specialOffer
  }

  if (terms) {
    text = text ? `${text} (Terms: ${terms})` : `Terms: ${terms}`
  }

  if (code) {
    text = text ? `${text} (Code: ${code})` : `Code: ${code}`
  }

  return text
}
