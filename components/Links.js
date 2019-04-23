import React from 'react'
import Link from 'next/link'

export const ProductLink = (props) => (
  <Link
    href={`/product?productId=${props.productId}`}
    as={`/product/${props.productId}`}
    >
    {props.children}
  </Link>
)

export const CategoryLink = (props) => (
  <Link
    href={`/category?categoryId=${props.categoryId}`}
    as={`/category/${props.categoryId}`}>
    {props.children}
  </Link>
)

export const SearchLink = ({ subcategoryId, searchPhrase, pageNo, children }) => {
  // TODO: can we alias this to a clean url?
  const args = { subcategoryId, searchPhrase, pageNo }
  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  return (
    <Link
      href={`/search${queryString}`}>
      {children}
    </Link>
  )
}
