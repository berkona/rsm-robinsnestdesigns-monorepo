const reduceUser = (row) => {
  return {
    id: row.ID,
    email: row.Email,
    firstName: row.FirstName,
    lastName: row.LastName,
    address: row.Address,
    city: row.City,
    state: row.State,
    zip: row.Zip,
    country: row.Country,
    phone: row.Phone,
  }
}

module.exports = reduceUser
