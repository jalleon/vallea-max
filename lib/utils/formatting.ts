export const formatCurrency = (
  value: number,
  currency: 'CAD' | 'USD' = 'CAD'
): string => {
  const locale = currency === 'CAD' ? 'fr-CA' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export const formatMeasurement = (
  value: number,
  type: 'area' | 'length',
  unit: 'm2' | 'pi2' | 'm' | 'pi'
): string => {
  const conversions = {
    area: {
      m2ToPi2: (m2: number) => m2 * 10.764,
      pi2ToM2: (pi2: number) => pi2 / 10.764
    },
    length: {
      mToPi: (m: number) => m * 3.281,
      piToM: (pi: number) => pi / 3.281
    }
  }

  // Always display both units
  if (type === 'area') {
    const m2 = unit === 'm2' ? value : conversions.area.pi2ToM2(value)
    const pi2 = conversions.area.m2ToPi2(m2)
    return `${m2.toFixed(2)} m² / ${pi2.toFixed(0)} pi²`
  } else {
    const m = unit === 'm' ? value : conversions.length.piToM(value)
    const pi = conversions.length.mToPi(m)
    return `${m.toFixed(2)} m / ${pi.toFixed(1)} pi`
  }
}

export const formatArea = (
  value: number,
  unit: 'm2' | 'pi2'
): string => {
  return `${value.toFixed(2)} ${unit}`
}

export const convertM2ToPi2 = (m2: number): number => {
  return m2 * 10.764
}

export const convertPi2ToM2 = (pi2: number): number => {
  return pi2 / 10.764
}

export const convertMToPi = (m: number): number => {
  return m * 3.281
}

export const convertPiToM = (pi: number): number => {
  return pi / 3.281
}

export const formatDate = (date: Date | string, locale: 'fr' | 'en' = 'fr'): string => {
  let dateObj: Date

  if (typeof date === 'string') {
    // Extract just the date part if it's a timestamp (e.g., "2021-07-01T00:00:00Z" -> "2021-07-01")
    const dateOnlyMatch = date.match(/^(\d{4}-\d{2}-\d{2})/)
    if (dateOnlyMatch) {
      const [year, month, day] = dateOnlyMatch[1].split('-').map(Number)
      dateObj = new Date(year, month - 1, day) // month is 0-indexed, parse in local time
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = date
  }

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export const parsePrice = (text: string | null | undefined): number | undefined => {
  if (!text) return undefined

  const cleanText = text.replace(/[^0-9.,]/g, '')
  const parsed = parseFloat(cleanText.replace(',', ''))

  return isNaN(parsed) ? undefined : parsed
}

export const parseNumber = (text: string | null | undefined): number | undefined => {
  if (!text) return undefined

  const parsed = parseFloat(text.replace(/[^0-9.]/g, ''))

  return isNaN(parsed) ? undefined : parsed
}

/**
 * Formats a Quebec lot number to the standard format: # ### ###
 * @param lotNumber - The lot number string (may contain spaces, hyphens, etc.)
 * @returns Formatted lot number as "# ### ###" or original value if not 7 digits
 */
export const formatLotNumber = (lotNumber: string | null | undefined): string => {
  if (!lotNumber) return ''

  // Remove all non-digit characters
  const digits = lotNumber.replace(/\D/g, '')

  // Only format if we have exactly 7 digits
  if (digits.length === 7) {
    return `${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}`
  }

  // Return digits as-is if not 7 characters (keep original behavior for other lengths)
  return digits || lotNumber
}