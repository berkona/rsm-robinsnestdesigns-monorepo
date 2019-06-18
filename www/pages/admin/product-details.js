import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyProductForm from '../../components/ModifyProductForm'
import { Query } from 'react-apollo'
import { PRODUCT_GET_ONE } from '../../constants/queries'
import Loader from '../../components/Loader'
import ApolloError from '../../components/ApolloError'

export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Modify Product</h1>
  <Query query={PRODUCT_GET_ONE} variables={{ productId: props.router.query.productId }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      return <ModifyProductForm product={data.product} />
    }}
  </Query>
</div></Col>)
