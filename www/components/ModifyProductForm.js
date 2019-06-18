import React from 'react'
import Form from 'react-bootstrap/Form'
import { Query } from 'react-apollo'
import { CATEGORY_GET, SUBCATEGORY_GET_ALL } from '../constants/queries'
import Loader from './Loader'
import ApolloError from './ApolloError'

class ModifyProductForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      product: this.props.product || {}
    }
  }

  render() {
    const MakeGroup = (props) => <Form.Group controlId={props.controlId}>
      <Form.Label>{props.label}</Form.Label>
      <Form.Control value={this.state.product[props.field] || ''} onChange={() => {
        const newState = { product: {} }
        newState.product[props.field] = event.target.value
        this.setState(newState);
      }} />
    </Form.Group>
    return <Query query={CATEGORY_GET}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      const { allCategories } = data
      return <Query query={SUBCATEGORY_GET_ALL}>
      {({ loading, error, data }) => {
        if (loading) return <Loader />
        if (error) return <ApolloError error={error} />
        const { allSubcategories } = data
        return <Form onSubmit={() => { event.preventDefault(); }}>
          <MakeGroup controlId="ModifyProductForm-sku" label="SKU" field="sku" />
          <MakeGroup controlId="ModifyProductForm-name" label="Name" field="name" />
          <MakeGroup controlId="ModifyProductForm-price" label="Price" field="price" />
          <Form.Group controlId="ModifyProductForm-category1">
            <Form.Label>Category 1</Form.Label>
            <Form.Control as="select" value={this.state.product.categoryId} onChange={() => this.setState({ product: { categoryId: event.target.value }})}>
              <option value={null}>Set to None</option>
              {allCategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="ModifyProductForm-subcategory1">
            <Form.Label>Subcategory 1</Form.Label>
            <Form.Control as="select" value={this.state.product.subcategoryId} onChange={() => this.setState({ product: { subcategoryId: event.target.value }})}>
              <option value={null}>Set to None</option>
              {allSubcategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Form.Control>
          </Form.Group>
        </Form>
      }}
      </Query>
    }}
    </Query>
  }
}

export default ModifyProductForm
