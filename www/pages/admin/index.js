import React from 'react'
import Col from 'react-bootstrap/Col'
import Link from 'next/link'

export default (props) => (
  <Col><div style={{ padding: '24px'}}>
    <h1>Admin Menu</h1>
    <hr />
    <ul>
      <li>
        <Link href="/admin/product-create">
          <a>Create Product</a>
        </Link>
      </li>
      <li>
        <Link href="/admin/products">
          <a>Modify Products</a>
        </Link>
      </li>
      <li>
        <Link href="/admin/category-create">
          <a>Add Category</a>
        </Link>
      </li>
      <li>
        <Link href="/admin/categories">
          <a>Modify Categories</a>
        </Link>
      </li>
      <li>
        <Link href="/admin/promo-create">
          <a>Create Promo</a>
        </Link>
      </li>
      <li>
        <Link href="/admin/promos">
          <a>Modify Promos</a>
        </Link>
      </li>
    </ul>
  </div></Col>
)
