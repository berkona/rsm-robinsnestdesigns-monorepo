import React from 'react'
import Link from 'next/link'
import slugify from 'slugify'
import { Actions } from '../lib/next-ga-ec'

export ProductLinkStr = (props) => (
  `/product/${props.productId}/${slugify('' + props.category)}/${slugify('' + props.subcategory)}/${slugify('' + props.title)}?listref=${props.listName}`
)

export const ProductLink = (props) => (
  <Link href={`/product?productId=${props.productId}&listref=${props.listName}`} as={ProductLinkStr(props)} prefetch>
    <a onClick={() => Actions.ProductClick({ sku: props.sku, category: props.category + '/' + props.subcategory, name: props.title, position: props.position, list: props.listName })}>{props.children}</a>
  </Link>
)

export const CategoryLink = (props) => (
  <Link href={`/category?categoryId=${props.categoryId}`} prefetch>
    {props.children}
  </Link>
)

export const SearchLinkStr = (args) => {
  const { categoryId, subcategoryId, pageNo } = args
  delete args.categoryId
  delete args.subcategoryId
  delete args.pageNo

  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  let url = '/search'
  if (categoryId) {
    url += '/c/' + categoryId
  }
  if (subcategoryId) {
    url += '/sc/' + subcategoryId
  }
  if (pageNo) {
    url += '/p/' + pageNo
  }
  return url + queryString
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
