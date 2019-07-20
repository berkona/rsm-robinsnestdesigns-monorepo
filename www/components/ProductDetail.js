import React from 'react'
import { Query } from 'react-apollo'
import Loader from './Loader'
import gql from 'graphql-tag'
import SEO from './SEO'
import Breadcrumb from './Breadcrumb'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Link from 'next/link'
import ProductList from './ProductList'
import AddToCart from './AddToCart'
import AddToWishList from './AddToWishList'
import PriceDisplay from './PriceDisplay'
import { Product, ProductDetailAction } from '../lib/next-ga-ec'
import ProductImage from './ProductImage'
import Head from 'next/head'

export const pageQuery = gql`
query($id: ID!) {
  product(productId: $id) {
    id
    sku
    name
    qtyInStock
    category
    categoryId
    subcategory
    subcategoryId
    isOnSale
    price
    salePrice
    saleStart
    saleEnd
    description
    image
    thumbnail
    hyperlinkedImage
    productVariants {
      id
      price
      text
    }
  }
}
`

const DEFAULT_KEYWORDS = 'cross,stitch,needlepoint,quilting,punchneedle,patterns,charts,graphs,needles,DMC,Anchor,Mill,Hill,Pearl,perle,cotton,beads,floss,kits,linen,Aida,Lugana,evenweave,afghans,tabletop,placemats,napkins,bread,covers,cloths,Jubilee,Jobelan,Wichelt,Zweigart,Charles,Kreinik,metallic,threads,Marlitt,Lavender,Lace,Mirabilia,Butternut,Road,nora,Corbett,Marilyn,Imblum,Pooh,Disney,John,James,Piecemakers,tapestry,beading,baby,bibs,towels,bookmark,fabrics,leaflets,books,needlework,stitchery,needlearts,sewing,crafts,keepsakes,collectibles,heirloom,gifts,home,decor,furnishings,flowers,Christmas,ornaments,cats,dogs'.split(',')

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > rangeStart && timestamp < rangeEnd
}

const TokenizeStr = (str) => {
  return str && str.split(' ').map(s => {
    return s && s.trim().replace(/\W+/g, '')
  }).filter(s => s && s.length) || []
}

const MakeSEOKeywords = (product) => {
  return Array.from(new Set(
    DEFAULT_KEYWORDS,
    TokenizeStr(product.name)
    .concat(TokenizeStr(product.description))
    .concat(TokenizeStr(product.category))
    .concat(TokenizeStr(product.subcategory))
  )).join(',')
}

const ProductDetail = (props) => (
  <Query key={props.productId} query={pageQuery} variables={{ id: Number.parseInt(props.productId) }}>
  {({ loading, error, data}) => {
    if (loading) return <Loader />
    if (error) return <div>Error fetching product: {error.toString()}</div>
    const parseDate = (dateStr) => {
      try {
        return Number.parseInt(dateStr)
      } catch (err) {
        return Date.parse(dateStr)
      }
    }
    const isOnSale = data.product.salePrice > 0 && IsWithinDateRange(Date.now(), parseDate(data.product.saleStart), parseDate(data.product.saleEnd))
    const shippingTime = data.product.qtyInStock > 0 ? 'Ships in 1-2 business days' : 'Order by Tuesday at 12 PM ET'
    return (
      <div className="product-detail">
      <style jsx>{`
        .product-detail {
          margin-top: 16px;
        }
      `}</style>
      <ProductDetailAction />
      <Product sku={data.product.sku}
               name={data.product.name}
               category={data.product.category + '/' + data.product.subcategory}
               price={
                 data.product.productVariants.length > 0
                 ? data.product.productVariants[0].price
                 : data.product.isOnSale
                    ? data.product.salePrice
                    : data.product.price
                }
                variant={
                  data.product.productVariants.length > 0
                  ? data.product.productVariants[0].text
                  : undefined
                }
                qty={1}
                list={props.listref}
               />
      <SEO
        title={data.product.name + ' | ' + data.product.category + ' | ' + data.product.subcategory}
        description={'Check out ' + data.product.name + ' and more exclusive items at Robin\'s Nest Designs now. ' + data.product.description}
        keywords={MakeSEOKeywords(data.product)}
      />
      <Row>
        <Col>
          <Breadcrumb query={{categoryId: data.product.categoryId, subcategoryId: data.product.subcategoryId, product: data.product }} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={7}>
          <div style={{  padding: '0px 24px' }}>
            <div className="product-large-image">
              <ProductImage product={data.product} />
              <Head>
                <meta name="og:image" content={data.product.hyperlinkedImage || (data.product.image && `https://www.robinsnestdesigns.com/ahpimages/${data.product.image}`) || (data.product.thumbnail && `https://www.robinsnestdesigns.com/ahpimages/${data.product.thumbnail}`)} />
              </Head>
            </div>
          </div>
        </Col>
        <Col xs={12} md={5}>
          <div style={{  padding: '0px 24px' }}>
            <h3 className="product-title">{data.product.name} <span style={{ fontColor: '#888', fontSize: '14px' }}>(SKU: {data.product.sku})</span></h3>
            <div style={{ margin: '.5em 0' }}>
              <PriceDisplay product={data.product} isOnSale={isOnSale} />
            </div>

            <AddToCart productId={data.product.id} maxQuantity={data.product.qtyInStock || undefined } listref={props.listref} />
            <div style={{ marginTop: '10px' }}>
            <AddToWishList productId={data.product.id} />
            </div>

            <hr style={{ color: '#888' }} />
            <h2>Shipping</h2>
            <p>{shippingTime}</p>
            <p><Link href="/ShippingInfo/shipping"><a>See shipping policy</a></Link></p>

            <hr style={{ color: '#888' }} />
            <h2>Returns</h2>
            <p>Returns and exchanges accepted</p>
            <p><Link href="/Policies/Policies"><a>See return policy</a></Link></p>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{ padding: '0px 24px' }}>
            <h1>Description</h1>
            <p dangerouslySetInnerHTML={{__html: data.product.description }}></p>
            <hr style={{ color: '#888' }} />
            <h1>Related Items</h1>
            <ProductList isTeaser={true} limit={8} categoryId={data.product.categoryId} subcategoryId={data.product.subcategoryId} sortOrder="random" listName={'ProductDetail - Related Items'}/>
          </div>
        </Col>
      </Row>
      </div>
    )
  }}
</Query>

)

export default ProductDetail
