import React from "react"
import Link from 'next/link'
import { SearchLink } from './Links'

const TopLinks = (props) => (
  // TODO: Fix these links
  <div id="topLinks">
    <ul>
	   <li>
        <Link href="/cart">
          <a>
            <img src="/static/viewmycart1.gif" alt="View My Cart" border="0" />
          </a>
        </Link>
      </li>
      <li>
        <Link href="/wishlist">
          <a>
            <img src="/static/viewmylist1.gif" alt="View My List" border="0" />
          </a>
        </Link>
      </li>
      <li>
        <SearchLink onSaleOnly={true}>
        <a>On Sale</a>
        </SearchLink>
      </li>
      <li>
        <SearchLink newOnly={true}>
          <a>What's New</a>
        </SearchLink>
      </li>
    </ul>
  </div>
)

export default TopLinks
