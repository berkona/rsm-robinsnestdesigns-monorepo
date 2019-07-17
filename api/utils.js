const isOnSale = (obj) => obj.salePrice
  && obj.saleStart
  && obj.saleEnd
  && obj.salePrice > 0
  && IsWithinDateRange(Date.now(), ParseDate(obj.saleStart), ParseDate(obj.saleEnd)) || false

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > rangeStart && timestamp < rangeEnd
}

const ParseDate = (dateStr) => {
  const retVal = Number.parseInt(dateStr)
  return Number.isNaN(retVal) ? Date.parse(dateStr) : retVal
}

module.exports = {
  isOnSale,
  IsWithinDateRange,
  ParseDate,
}
