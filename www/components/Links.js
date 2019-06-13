import React from 'react'
import Link from 'next/link'
import slugify from 'slugify'
import { productClickEvent } from '../lib/react-ga'

export const ProductLink = (props) => (
  <Link href={`/product?productId=${props.productId}&listref=${props.listName}`} as={`/product/${props.productId}/${slugify('' + props.category)}/${slugify('' + props.subcategory)}/${slugify('' + props.title)}?listref=${props.listName}`} prefetch>
    <a onClick={() => productClickEvent({ id: props.productId, category: props.category, subcategory: props.subcategory, name: props.title }, props.position, props.listName)}>{props.children}</a>
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
