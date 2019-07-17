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

const CREATE_PRODUCT = gql`
mutation($token: String!, $productData: ProductInsertInput!) {
  createProduct(token: $token, productData: $productData) {
    id
  }
}
`

export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Create Product</h1>
  <hr />
  <Query query={PRODUCT_GET_ONE} variables={{ productId: props.router.query.productId }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      data = data || {}
      const { product } = data
      return <CurrentUserContext.Consumer>
      {currentUser => <>
        <Mutation mutation={CREATE_PRODUCT} variables={{ token: currentUser.getToken() }}>
          {(mutationFn, {loading, error, data }) => {
            return <>
            <ModifyProductForm
              saveLabel={'Create'}
              product={product}
              onSubmit={newProduct => {
                event.preventDefault()
                const productData = {}
                Object.keys(newProduct)
                  .filter(field => MODIFIABLE_FIELDS.indexOf(field) !== -1)
                  .forEach(field => productData[field] = newProduct[field])
                productData.productVariants = (productData.productVariants || []).map(x => { return { price: x.price, text: x.text } })
                mutationFn({ variables: { productData, } }).then(({ data: { createProduct: { id } } }) => Router.push('/admin/product-details?productId=' + id))
              }}
            />
            { error && <ApolloError error={error} />}
            </>
          }}
        </Mutation>
        </>}
      </CurrentUserContext.Consumer>
    }}
    </Query>
</div></Col>)
