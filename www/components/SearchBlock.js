import React from "react"
import {
	Query
} from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import { SearchLink, SearchLinkStr } from './Links'
import CategoryLinks from './CategoryLinks'

import Form from 'react-bootstrap/Form'

const numberItems = gql `
query {
  allProducts {
    total
  }
}
`

const findCategory = gql `
query {
  allCategories {
    id
    title
  }
}
`

const findSubcategory = gql `
query($categoryId: ID!) {
  allSubcategories(categoryId: $categoryId) {
    id
    title
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

		self.handleCategoryChange = (option) => {
			self.setState({
				categoryId: option && option.value,
				subcategoryId: null,
			}, () => Router.push(SearchLinkStr(self.state)))
		}

		self.handleSubcategoryChange = (option) => {
			self.setState({
				subcategoryId: option && option.value,
			}, () => Router.push(SearchLinkStr(self.state)))
		}
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
					<Form.Check type="checkbox" label="On Sale" checked={self.state.onSaleOnly} onChange={self.handleOnSaleOnlyChange}></Form.Check>
					<Form.Check type="checkbox" label="Recently Added" checked={self.state.newOnly} onChange={self.handleNewOnlyChange}></Form.Check>
				</Form.Group>

				<Form.Group controlId="categoryId">
					<Form.Label>Category</Form.Label>
					{ self.state.categoryId ? <Query query={findCategory}>
						{({ loading, error, data}) => {
							const category = data
								&& data.allCategories
								&& data.allCategories
										.filter(x => x.id == self.state.categoryId)
										[0]
								|| null
							if (!category) {
								return <ul><li><SearchLink searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
									<a>&lt; {self.state.categoryId}</a>
									</SearchLink></li></ul>
							} else {
									return <ul><li><SearchLink searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
									<a>&lt; {category.title}</a>
									</SearchLink></li></ul>
							}

						}}
					</Query>
				:	this.props.categories ? <CategoryLinks categories={this.props.categories} /> : <></>
				}
				</Form.Group>

				{
					self.state.categoryId
					? <Form.Group controlId="subcategoryId">
						<Form.Label>Subcategory</Form.Label>
						<Query query={findSubcategory} variables={{ categoryId: self.state.categoryId }}>
								{({ loading, error, data}) => {
									if (loading) {
										return <p>Loading...</p>
									}

									if (error) {
										return <p>Network error {error.toString()}</p>
									}

									if (self.state.subcategoryId) {
										const subcategories = (this.props.subcategories || data && data.allSubcategories)
										const subcat = subcategories && subcategories
													.filter(x => x.id == self.state.subcategoryId)
													[0]
											|| null
										return <ul><li><SearchLink categoryId={self.state.categoryId} searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
											<a>&#60; {subcat && subcat.title || self.state.subcategoryId}</a>
										</SearchLink></li></ul>
									} else {
										return <ul>
											{(this.props.subcategories || data.allSubcategories).map(c => (
												<li key={c.id}><SearchLink categoryId={self.state.categoryId} subcategoryId={c.id} searchPhrase={self.state.searchPhrase} onSaleOnly={self.state.onSaleOnly} newOnly={self.state.newOnly}>
													<a>{c.title}</a>
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
