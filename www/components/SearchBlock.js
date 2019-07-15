import React from "react"
import {
	Query
} from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import { SearchLink, SearchLinkStr } from './Links'
import CategoryLinks from './CategoryLinks'
import ApolloError from './ApolloError'

import Form from 'react-bootstrap/Form'

const findCategory = gql`
query(
  $categoryId: ID,
  $subcategoryId: ID,
  $searchPhrase: String,
  $onSaleOnly: Boolean,
  $newOnly: Boolean) {
  allProducts(
    categoryId: $categoryId,
    subcategoryId: $subcategoryId,
    searchPhrase: $searchPhrase,
    onSaleOnly: $onSaleOnly,
    newOnly: $newOnly) {
  	categories {
			id
			title
		}
  }
}
`

const findSubcategory = gql `
query(
  $categoryId: ID,
  $subcategoryId: ID,
  $searchPhrase: String,
  $onSaleOnly: Boolean,
  $newOnly: Boolean) {
  allProducts(
    categoryId: $categoryId,
    subcategoryId: $subcategoryId,
    searchPhrase: $searchPhrase,
    onSaleOnly: $onSaleOnly,
    newOnly: $newOnly) {
  	subcategories {
			id
			title
		}
  }
}
`

class SearchBlock extends React.Component {
	constructor(props) {
		super(props)
    const {
      searchPhrase,
      categoryId,
      subcategoryId,
      onSaleOnly,
      newOnly,
			sortOrder,
    } = props

		this.state = {
      searchPhrase,
      categoryId,
      subcategoryId,
      onSaleOnly,
      newOnly,
			sortOrder,
		}

		this.componentDidUpdate = this.componentDidUpdate.bind(this);

		const self = this
		let handleCheckToggle = (event, stateField) => {
			const v = event.target.checked
			const dState = {}
			dState[stateField] = v
			self.setState(dState, () => Router.push(SearchLinkStr(self.state)))
		}
		self.handleOnSaleOnlyChange = (event) => handleCheckToggle(event, 'onSaleOnly')
		self.handleNewOnlyChange = (event) => handleCheckToggle(event, 'newOnly')
	}

	componentDidUpdate(prevProps) {
		if (this.props.searchPhrase != prevProps.searchPhrase
			|| this.props.categoryId != prevProps.categoryId
		  || this.props.subcategoryId != prevProps.subcategoryId
		  || this.props.onSaleOnly != prevProps.onSaleOnly
		  || this.props.newOnly != prevProps.newOnly) {
				const {
		      searchPhrase,
		      categoryId,
		      subcategoryId,
		      onSaleOnly,
		      newOnly
		    } = this.props

				this.setState({
		      searchPhrase,
		      categoryId,
		      subcategoryId,
		      onSaleOnly,
		      newOnly,
				})
		}
	}

	render() {
    const self = this
		return (
			<Form>
				<Form.Group>
					<Form.Label>Special Offers</Form.Label>
					<Form.Check type="checkbox" label="On Sale" checked={self.state.onSaleOnly == "true"} onChange={self.handleOnSaleOnlyChange}></Form.Check>
					<Form.Check type="checkbox" label="Recently Added" checked={self.state.newOnly == "true"} onChange={self.handleNewOnlyChange}></Form.Check>
				</Form.Group>

				<Form.Group controlId="categoryId">
					<Form.Label>Category</Form.Label>
					<Query query={findCategory} variables={{
						searchPhrase: self.state.searchPhrase,
						categoryId: self.state.categoryId,
						subcategoryId: self.state.subcategoryId,
						onSaleOnly: self.state.onSaleOnly == "true",
						newOnly: self.state.newOnly == "true"
					}}>
						{({ loading, error, data}) => {
							if (loading) return <p>Loading...</p>
							if (error) return <ApolloError error={error} />

							if (self.state.categoryId) {
								const category = data
									&& data.allProducts.categories
									&& data.allProducts.categories
											.filter(x => x.id == self.state.categoryId)
											[0]
									|| null
								if (!category) {
									return <ul><li><SearchLink searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
										<a style={{ fontSize: '16px', }}>&lt; {self.state.categoryId}</a>
										</SearchLink></li></ul>
								} else {
										return <ul><li><SearchLink searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
										<a style={{ fontSize: '16px', }}>&lt; {category.title}</a>
										</SearchLink></li></ul>
								}
							} else {
								return <CategoryLinks categories={data.allProducts.categories} />
							}
						}}
					</Query>
				</Form.Group>

				{
					self.state.categoryId
					? <Form.Group controlId="subcategoryId">
						<Form.Label>Subcategory</Form.Label>
						<Query query={findSubcategory} variables={{
							searchPhrase: self.state.searchPhrase,
							categoryId: self.state.categoryId,
							subcategoryId: self.state.subcategoryId,
							onSaleOnly: self.state.onSaleOnly == "true",
							newOnly: self.state.newOnly == "true"
						}}>
								{({ loading, error, data}) => {
									if (loading) {
										return <p>Loading...</p>
									}

									if (error) return <ApolloError error={error} />

									const subcategories = (data && data.allProducts && data.allProducts.subcategories )

									if (self.state.subcategoryId) {
										const subcat = subcategories && subcategories
													.filter(x => x.id == self.state.subcategoryId)
													[0]
											|| null
										return <ul><li><SearchLink categoryId={self.state.categoryId} searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
											<a style={{ fontSize: '16px', }}>&#60; {subcat && subcat.title || self.state.subcategoryId}</a>
										</SearchLink></li></ul>
									} else {
										return <ul>
											{subcategories.map(c => (
												<li key={c.id}><SearchLink categoryId={self.state.categoryId} subcategoryId={c.id} searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
													<a style={{ fontSize: '16px', }}>{c.title}</a>
												</SearchLink></li>
											))}
										</ul>
									}
								}}
							</Query>
						</Form.Group> : <></>
				}
			</Form>
		)
	}
}

export default SearchBlock
