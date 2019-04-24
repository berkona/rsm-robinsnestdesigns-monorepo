import React from 'react'
import Link from 'next/link'

export const ProductLink = (props) => (
  <Link href={`/product?productId=${props.productId}`}>
    {props.children}
  </Link>
)

export const CategoryLink = (props) => (
  <Link href={`/category?categoryId=${props.categoryId}`}>
    {props.children}
  </Link>
)

export const SearchLink = ({ categoryId, subcategoryId, searchPhrase, pageNo, onSaleOnly, children }) => {
  // TODO: can we alias this to a clean url?
  const args = { categoryId, subcategoryId, searchPhrase, pageNo }
  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  const prefix = onSaleOnly ? '/on-sale' : '/search'
  const link = prefix + queryString
  return (
    <Link href={link}>
      {children}
    </Link>
  )
}
