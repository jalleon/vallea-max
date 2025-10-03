type AdjustmentData = Record<string, { amount: number } | undefined>

export const calculateAdjustedValue = (
  salePrice: number,
  adjustments: AdjustmentData
): number => {
  let totalAdjustment = 0

  // Add all adjustments
  Object.values(adjustments).forEach(adj => {
    if (adj && 'amount' in adj) {
      totalAdjustment += adj.amount
    }
  })

  return salePrice + totalAdjustment
}

export const calculateWeightedAverage = (
  comparables: Array<{ adjusted_value: number; weight: number }>
): number => {
  const totalWeight = comparables.reduce((sum, c) => sum + c.weight, 0)
  const weightedSum = comparables.reduce(
    (sum, c) => sum + c.adjusted_value * c.weight,
    0
  )

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

export const calculateMarketAdjustment = (
  salePrice: number,
  percentage: number
): number => {
  return salePrice * (percentage / 100)
}

export const calculateSizeAdjustment = (
  difference: number,
  ratePerUnit: number
): number => {
  return difference * ratePerUnit
}

export const calculateAgeAdjustment = (
  salePrice: number,
  yearsDifference: number,
  percentagePerYear: number
): number => {
  return salePrice * (yearsDifference * percentagePerYear / 100)
}

export const calculatePercentageAdjustment = (
  baseValue: number,
  percentage: number
): number => {
  return baseValue * (percentage / 100)
}

export const calculatePricePerSquareFoot = (
  price: number,
  areaInSquareFeet: number
): number => {
  return areaInSquareFeet > 0 ? price / areaInSquareFeet : 0
}

export const calculateGrossRentMultiplier = (
  salePrice: number,
  annualRent: number
): number => {
  return annualRent > 0 ? salePrice / annualRent : 0
}

export const calculateCapRate = (
  netOperatingIncome: number,
  propertyValue: number
): number => {
  return propertyValue > 0 ? (netOperatingIncome / propertyValue) * 100 : 0
}

export const roundToNearest = (value: number, nearest: number = 1000): number => {
  return Math.round(value / nearest) * nearest
}

export const calculateDepreciation = (
  age: number,
  totalLifespan: number,
  depreciationMethod: 'straight-line' | 'economic' = 'straight-line'
): number => {
  if (depreciationMethod === 'straight-line') {
    return Math.min(age / totalLifespan, 1)
  }

  // Economic depreciation curve
  const depreciation = 1 - Math.pow(1 - (age / totalLifespan), 2)
  return Math.min(depreciation, 1)
}

export const calculateReplacementCost = (
  areaInSquareFeet: number,
  costPerSquareFoot: number,
  qualityMultiplier: number = 1
): number => {
  return areaInSquareFeet * costPerSquareFoot * qualityMultiplier
}