import React from "react"

const SearchBlock = (props) => (
  // TODO: Finish this form
  <div id="search">
    <form style={{ marginBottom: '10px' }}>
      <label>Search our 45692 item online catalog.</label>
      <input type="text" name="KeyWords" size="15" maxLength="60" />
      <input type="submit" value="Go" />
    </form>
  </div>
)

export default SearchBlock
