import React from "react"
import { SearchLink } from './Links'

const TopLinks = (props) => (
  // TODO: Fix these links
  <div id="topLinks">
    <ul>
      <li>
        <SearchLink onSaleOnly={true} sortOrder="mostRecent">
        <a>On Sale</a>
        </SearchLink>
      </li>
      <li>
        <SearchLink newOnly={true} sortOrder="mostRecent">
          <a>What's New</a>
        </SearchLink>
      </li>
    </ul>
  </div>
)

export default TopLinks
