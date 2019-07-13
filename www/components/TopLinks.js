import React from "react"
import { SearchLink } from './Links'

const TopLinks = (props) => (
  // TODO: Fix these links
  <div id="categories">
    <ul>
      <li className="subcategory" style={{ fontSize: '16px' }}>
        <SearchLink onSaleOnly={true} sortOrder="mostRecent">
        <a>On Sale</a>
        </SearchLink>
      </li>
      <li className="subcategory" style={{ fontSize: '16px' }}>
        <SearchLink newOnly={true} sortOrder="mostRecent">
          <a>What's New</a>
        </SearchLink>
      </li>
    </ul>
  </div>
)

export default TopLinks
