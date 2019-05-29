import React from "react"
import {
	Query
} from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import { SearchLinkStr } from './Links'

import Select from 'react-select'
import Toggle from 'react-toggle'

const SEARCH_DELAY = 1000

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
      newOnly
    } = props

		this.state = {
      searchPhrase,
      categoryId,
      subcategoryId,
      onSaleOnly,
      newOnly,
			searchTimeout: null,
		}

		this.componentDidUpdate = this.componentDidUpdate.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		const self = this
		let handleCheckToggle = (event, stateField) => {
			const v = event.target.checked
			const dState = {}
			dState[stateField] = v
			self.setState(dState, () => self.handleSubmit(event))
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

	handleSearchChange(event) {
		const self = this
		self.setState({
			searchPhrase: event.target.value,
		}, () => {
			if (self.searchTimeout) {
				clearTimeout(self.searchTimeout)
			}
			self.searchTimeout = setTimeout(() => Router.push(SearchLinkStr(self.state)), SEARCH_DELAY)
		});
	}

	handleSubmit(event) {
		event.preventDefault()
		Router.push(SearchLinkStr(this.state))
	}

	render() {
    const self = this
		return ( <div id = "search" >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
				<label > Search our 45692 item online catalog. < /label>
	      <form style = {
					{
						width: '100%',
						display: 'flex',
	          flexDirection: 'column',
					}
				}
				onSubmit = {this.handleSubmit} >
					<input
						style={{ width: '95%', fontSize: '20px' }}
						type = "text"
						value = {this.state.searchPhrase}
						onChange = {this.handleSearchChange}
					/>
		      <button style = {{ width: '36px' }} type = "submit" >
					   <img src = "/static/magnifying-glass.svg" height = "21" / >
					</button>
				</form>
      </div>

			<div style={{
					height: '22px',
					display: 'flex',
					flexDirection: 'row',
    			justifyContent: 'space-between',
    			marginTop: '8px'
			}}>
				<div style={{ width: '286px'}}>
				Category
				</div>
				<div style={{ width: '286px', marginLeft: '10px'}}>
				Subcategory
				</div>
				<div style={{width: '70px', marginLeft: '10px'}}>
				On Sale
				</div>
				<div style={{ width: '70px', marginLeft: '10px' }}>
				New
				</div>
			</div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ width: '286px'}}>
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
        </div>
        <div style={{ width: '286px', marginLeft: '10px' }}>
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
        </div>
        <div style={{ width: '70px', marginLeft: '10px' }}>
					<label style={{ marginTop: '6px' }}>
						<Toggle checked={!!self.state.onSaleOnly} onChange={self.handleOnSaleOnlyChange} />
					</label>
        </div>
        <div style={{ width: '70px', marginLeft: '10px' }}>
					<label style={{ marginTop: '6px' }}>
						<Toggle checked={!!self.state.newOnly} onChange={self.handleNewOnlyChange} />
					</label>
        </div>
      </div>

      </div>
		)
	}
}

export default SearchBlock
