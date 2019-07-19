const reducePromo = (row) => {
  return {
    id: row.ID,
    coupon: row.Coupon,
    starts: row.Starts,
    ends: row.Ends,
    moneyOff: row.MoneyOff,
    percentageOff: row.PercentageOff,
    requiresTotal: row.PriceBreak,
    freeShipping: !!row.FreeShipping,
  }
}

module.exports = reducePromo
