import React from "react"
import {
	Query
} from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import { SearchLinkStr } from './Links'

import Select from 'react-select'
import Toggle from 'react-toggle'

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
					{
						<Query query={findCategory}>
							{({ loading, error, data}) => {
								return <Select
												options={data && data.allCategories && data.allCategories.map(c => { return { label: c.title, value: c.id } })}
												isClearable={true}
												isSearchable={true}
												isLoading={loading}
												defaultValue={{ label: loading ? 'Loading...' : 'Select...', value: null }}
												value={data
													&& data.allCategories
													&& data.allCategories
															.filter(x => x.id == self.state.categoryId)
															.map(c => { return { label: c.title, value: c.id } })[0]
													|| null
												}
												onChange={self.handleCategoryChange}
											 />
							}}
						</Query>
					}
				</Form.Group>
				<Form.Group controlId="subcategoryId">
					<Form.Label>Subcategory</Form.Label>
					{
						self.state.categoryId ?
						<Query query={findSubcategory} variables={{ categoryId: self.state.categoryId }}>
							{({ loading, error, data}) => {
								return <Select
												options={data && data.allSubcategories && data.allSubcategories.map(c => { return { label: c.title, value: c.id } })}
												isClearable={true}
												isSearchable={true}
												isLoading={loading}
												defaultValue={{ label: loading ? 'Loading...' : 'Select...', value: null }}
												value={data
													&& data.allSubcategories
													&& data.allSubcategories
															.filter(x => x.id == self.state.subcategoryId)
															.map(c => { return { label: c.title, value: c.id } })[0]
													|| null
												}
												onChange={self.handleSubcategoryChange}
											 />
							}}
						</Query>
						:
						<Select options={[]}
										isClearable={true}
										isSearchable={true}
										isLoading={false}
										/>
					}
				</Form.Group>
			</Form>
		)
	}
}

export default SearchBlock
