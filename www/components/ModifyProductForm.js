import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Query } from 'react-apollo'
import { CATEGORY_GET, SUBCATEGORY_GET_ONE } from '../constants/queries'
import ApolloError from './ApolloError'
import UploadFileToAWS from './UploadFileToAWS'
import DatePicker from "react-datepicker";

const MakeMoneyGroup = (props) => <Form.Group controlId={props.controlId}>
  <Form.Label>{props.label}</Form.Label>
  <Form.Control type="number" value={(props.value)} onChange={props.onChange} />
</Form.Group>

const MakeGroup = (props) => <Form.Group controlId={props.controlId}>
  <Form.Label>{props.label}</Form.Label>
  <Form.Control value={props.value} onChange={props.onChange} />
</Form.Group>

const CategoryGroup = (props) => <Query query={CATEGORY_GET}>
  {({ loading, error, data }) => {
    if (error) return <ApolloError error={error} />
    if (loading || !data) return <></>
    const { allCategories } = data
    return <Form.Group controlId={props.controlId}>
      <Form.Label>{props.label}</Form.Label>
      <Form.Control as="select" value={props.value} onChange={props.onChange}>
        <option value={null}>Set to None</option>
        {allCategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </Form.Control>
    </Form.Group>
  }}
</Query>

const SubcategoryGroup = (props) => <Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: props.categoryId }}>
  {({ loading, error, data}) => {
    if (error) return <ApolloError error={error} />
    if (loading || !data) return <></>
    return <Form.Group controlId={props.controlId}>
      <Form.Label>{props.label}</Form.Label>
      <Form.Control as="select" value={props.value} onChange={props.onChange}>
        <option value={0}>Set to None</option>
        {data.allSubcategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </Form.Control>
    </Form.Group>
  }}
</Query>

class ModifyProductForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      product: this.props.product || {}
    }
  }

  render() {
    const setProductField = (field, value) => {
      const newState = { product: Object.assign({}, this.state.product) }
      newState.product[field] = value
      this.setState(newState);
    }
    //console.log(new Date(Number.parseInt(this.state.product.saleStart)))

    return <Form onSubmit={() => { event.preventDefault(); if (this.props.onSubmit) this.props.onSubmit(this.state.product) }}>
      <MakeGroup
        controlId="ModifyProductForm-sku"
        label="SKU"
        field="sku"
        value={this.state.product.sku}
        onChange={() => setProductField('sku', event.target.value) }/>
      <MakeGroup controlId="ModifyProductForm-name" label="Name" field="name"
      value={this.state.product.name}
      onChange={() => setProductField('name', event.target.value) }
      />
      <MakeMoneyGroup controlId="ModifyProductForm-price" label="Price" field="price"
        value={this.state.product.price || 0}
        onChange={() => setProductField('price', Number.parseFloat((Number.parseFloat(event.target.value) || 0).toFixed(2))) }
       />
       <MakeMoneyGroup controlId="ModifyProductForm-salePrice" label="Sale Price" field="salePrice"
         value={this.state.product.salePrice || 0}
         onChange={() => setProductField('salePrice', Number.parseFloat((Number.parseFloat(event.target.value) || 0).toFixed(2))) }
        />
        <Form.Group>
          <Form.Label>Sale Start</Form.Label>
          <Form.Control as="div">
            <DatePicker
              selected={new Date(Number.parseInt(this.state.product.saleStart))}
              onSelect={date => setProductField('saleStart', '' + date.getTime()) } />
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Sale End</Form.Label>
          <Form.Control as="div">
            <DatePicker
              selected={new Date(Number.parseInt(this.state.product.saleEnd))}
              onSelect={date => setProductField('saleEnd', '' + date.getTime()) } />
          </Form.Control>
        </Form.Group>
      <CategoryGroup controlId="ModifyProductForm-category1" label="Category 1" field="categoryId"
      value={this.state.product.categoryId}
      onChange={() => setProductField('categoryId', event.target.value) }
       />
      { this.state.product.categoryId > 0
        && <SubcategoryGroup controlId="ModifyProductForm-subcategory1"
        value={this.state.product.subcategoryId}
        onChange={() => setProductField('subcategoryId', event.target.value) }
        label="Subcategory 1" field="subcategoryId" categoryId={this.state.product.categoryId} />
      }
      <CategoryGroup controlId="ModifyProductForm-category2"
      value={this.state.product.category2}
      onChange={() => setProductField('category2', event.target.value) }
      label="Category 2" field="category2" />
      { this.state.product.category2 > 0
        && <SubcategoryGroup controlId="ModifyProductForm-subcategory2"
        value={this.state.product.subcategory2}
        onChange={() => setProductField('subcategory2', event.target.value) }
         label="Subcategory 2" field="subcategory2" categoryId={this.state.product.category2} />
      }
      <CategoryGroup controlId="ModifyProductForm-category3"
      value={this.state.product.category3}
      onChange={() => setProductField('category3', event.target.value) }
       label="Category 3" field="category3" />
      { this.state.product.category3 > 0
        && <SubcategoryGroup controlId="ModifyProductForm-subcategory3"
        value={this.state.product.subcategory3}
        onChange={() => setProductField('subcategory3', event.target.value) } label="Subcategory 3" field="subcategory3" categoryId={this.state.product.category3} />
      }
      <Form.Group controlId="ModifyProductForm-description">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" value={this.state.product.description} onChange={() => {
          setProductField('description', event.target.value)
        }} />
      </Form.Group>
      <MakeGroup controlId="ModifyProductForm-keywords" label="Keywords" value={this.state.product.keywords} onChange={() => setProductField('keywords', event.target.value)} />
      <UploadFileToAWS
        controlId="ModifyProductForm-image"
        label="Image"
        value={
          this.state.product.hyperlinkedImage
          || (this.state.product.image
            && `https://www.robinsnestdesigns.com/ahpimages/${this.state.product.image}`)
          ||  (this.state.product.thumbnail
            && `https://www.robinsnestdesigns.com/ahpimages/${this.state.product.thumbnail}`)}
        onChange={(url) => setProductField('hyperlinkedImage', url)} />

      <div style={{ marginTop: '16px' }}>
        <Button variant="primary" type="submit">
          <>{ this.state.product.id ? 'Save' : 'Create' }</>
        </Button>
      </div>
    </Form>
  }
}

export default ModifyProductForm
