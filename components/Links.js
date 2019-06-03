import React from 'react'
import Link from 'next/link'
import slugify from 'slugify'

export const ProductLink = (props) => (
  <Link href={`/product/${slugify('' + props.category)}/${slugify('' + props.subcategory)}/${props.productId}/${slugify('' + props.title)}`}>
    {props.children}
  </Link>
)

export const CategoryLink = (props) => (
  <Link href={`/category?categoryId=${props.categoryId}`}>
    {props.children}
  </Link>
)

export const SearchLinkStr = (args) => {
  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  return '/search' + queryString
}

export const SearchLink = ({ categoryId, subcategoryId, searchPhrase, pageNo, onSaleOnly, newOnly, children }) => {
  // TODO: can we alias this to a clean url?
  const link = SearchLinkStr({ categoryId, subcategoryId, searchPhrase, pageNo, onSaleOnly, newOnly })
  return (
    <Link href={link}>
      {children}
    </Link>
  )
}
