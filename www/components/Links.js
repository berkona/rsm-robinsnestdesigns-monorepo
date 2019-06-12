import React from 'react'
import Link from 'next/link'
import slugify from 'slugify'

export const ProductLink = (props) => (
  <Link href={`/product?productId=${props.productId}`} as={`/product/${props.productId}/${slugify('' + props.category)}/${slugify('' + props.subcategory)}/${slugify('' + props.title)}`} prefetch>
    {props.children}
  </Link>
)

export const CategoryLink = (props) => (
  <Link href={`/category?categoryId=${props.categoryId}`} prefetch>
    {props.children}
  </Link>
)

export const SearchLinkStr = (args) => {
  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  return '/search' + queryString
}

export const SearchLink = ({ categoryId, subcategoryId, searchPhrase, pageNo, onSaleOnly, newOnly, sortOrder, children }) => {
  // TODO: can we alias this to a clean url?
  const link = SearchLinkStr({ categoryId, subcategoryId, searchPhrase, pageNo, onSaleOnly, newOnly, sortOrder })
  return (
    <Link href={link} prefetch>
      {children}
    </Link>
  )
}
