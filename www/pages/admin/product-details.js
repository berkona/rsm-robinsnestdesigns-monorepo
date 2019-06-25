import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyProductForm from '../../components/ModifyProductForm'
import { Query, Mutation } from 'react-apollo'
import { PRODUCT_GET_ONE } from '../../constants/queries'
import Loader from '../../components/Loader'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'

const MODIFIABLE_FIELDS = [
  'sku',
  'name',
  'price',
  'salePrice',
  'qtyInStock',
  'saleStart',
  'saleEnd',
  'description',
  'hyperlinkedImage',
  'categoryId',
  'subcategoryId',
  'category2',
  'subcategory2',
  'category3',
  'subcategory3',
  'keywords',
  'productVariants',
]

const UPDATE_PRODUCT = gql`
mutation($token: String!, $productId: ID!, $productData: ProductPatchInput!) {
  updateProduct(token: $token, productId: $productId, productData: $productData) {
    id
  }
}
`

const DEACTIVATE_PRODUCT = gql`
mutation($token: String!, $productId: ID!) {
  removeProduct(token: $token, productId: $productId)
}
`

export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Modify Product</h1>
  <hr />
  <Query query={PRODUCT_GET_ONE} variables={{ productId: props.router.query.productId }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      const { product } = data
      return <CurrentUserContext.Consumer>
      {currentUser => <>
        <Mutation mutation={UPDATE_PRODUCT} variables={{ token: currentUser.getToken(), productId: props.router.query.productId  }} refetchQueries={[{ query: PRODUCT_GET_ONE, variables: { productId: props.router.query.productId } }]}>
          {(mutationFn, {loading, error, data }) => {
            return <>
            <ModifyProductForm
              product={product}
              onSubmit={newProduct => {
                event.preventDefault()
                const productData = {}
                Object.keys(newProduct)
                  .filter(field => MODIFIABLE_FIELDS.indexOf(field) !== -1)
                  .forEach(field => productData[field] = newProduct[field])
                productData.productVariants = (productData.productVariants || []).map(x => { return { price: x.price, text: x.text } })
                mutationFn({ variables: { productData, } }).then(() => Router.push('/admin/products'))
              }}
            />
            { error && <ApolloError error={error} />}
            </>
          }}
        </Mutation>
        <div style={{ marginTop: '48px' }}>
          <Link href={"/admin/product-create?productId=" + props.router.query.productId}>
            <Button variant="outline-dark">Duplicate</Button>
          </Link>
        </div>
        <Mutation mutation={DEACTIVATE_PRODUCT} variables={{ token: currentUser.getToken(), productId: props.router.query.productId  }}>
          {(mutationFn, { loaing, error, data }) => {
            return <div style={{ marginTop: '48px' }}><Button variant="danger" onClick={() => mutationFn().then(() => Router.push('/admin/products'))}>Deactivate Product</Button></div>
          }}
        </Mutation>
        </>}
      </CurrentUserContext.Consumer>
    }}
  </Query>
</div></Col>)
