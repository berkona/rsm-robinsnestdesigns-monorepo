import React from "react"
import Link from 'next/link'

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
        <Link href="/on-sale">
        <a>On Sale</a>
        </Link>
      </li>
      <li>
        <Link href="/whats-new">
          <a>What's New</a>
        </Link>
      </li>
    </ul>
  </div>
)

export default TopLinks
