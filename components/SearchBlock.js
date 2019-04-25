import React from "react"
import {
	Query
} from 'react-apollo'
import Link from 'next/link'
import gql from 'graphql-tag'
import { SearchLinkStr, SearchLink } from './Links'

const numberItems = gql `
query {
  allProducts {
    total
  }
}
`

const findCategory = gql `
query($categoryId: ID!) {
  category(categoryId: $categoryId) {
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
		super(props);
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
		};
		this.handleSearchChange = this.handleSearchChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSearchChange(event) {
		this.setState({
			searchPhrase: event.target.value
		});
	}

	handleSubmit(event) {
		event.preventDefault()
		document.location.href = SearchLinkStr(this.state)
	}

	render() {
    const self = this
		return ( <div id = "search" >
			<label > Search our 45692 item online catalog. < /label>
      <form style = {
				{
					width: '100%',
					display: 'flex',
          flexDirection: 'column',
				}
			}
			onSubmit = {
				this.handleSubmit
			} >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
			<input style = {
				{
					width: '95%',
					fontSize: '20px'
				}
			}
			type = "text"
			value = {
				this.state.searchPhrase
			}
			onChange = {
				this.handleSearchChange
			}
			/>
      <button style = {
				{
					width: '36px'
				}
			} type = "submit" >
			   <img src = "/static/magnifying-glass.svg" height = "21" / >
			</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <p>
          {
            self.props.categoryId ?
            <Query query={findCategory} variables={{ categoryId: self.props.categoryId }}>
              {({ loading, error, data}) => <span>Category: {data && data.category && data.category.title.slice(0, 25) || 'any'}</span>}
            </Query>
            :
            <span>Category: any</span>
          }
        </p>
        <p style={{marginLeft: '10px' }}>
          {
            self.props.categoryId ?
            <span>Subcategory:
              <Link href={`/category?categoryId=${this.props.categoryId}`}>
                <a style={{ paddingLeft: '5px' }}>
                {
                  self.props.subcategoryId ?
                  <Query query={findSubcategory} variables={{ categoryId: self.props.categoryId }}>
                    {({ loading, error, data }) => {
                      if (loading || error) return <span>loading...</span>
                      else return <span>{data.allSubcategories.filter(x => x.id == self.props.subcategoryId)[0].title.slice(0, 25)}</span>
                    }}
                  </Query>
                  :
                  <a>Select</a>
                }
                </a>
              </Link>
            </span>
            :
            <span>Subcategory: any</span>
          }
        </p>
        <p style={{marginLeft: '10px' }}>
          On Sale:
            <SearchLink
              categoryId={self.props.categoryId}
              subcategoryId={self.props.subcategoryId}
              searchPhrase={self.props.searchPhrase}
              onSaleOnly={!self.props.onSaleOnly}
              newOnly={self.props.newOnly}>
              <a style={{ paddingLeft: '5px' }}>
              {self.props.onSaleOnly ? 'Yes' : 'No'}
            </a>
          </SearchLink>
        </p>
        <p style={{marginLeft: '10px' }}>
          New:
            <SearchLink
              categoryId={self.props.categoryId}
              subcategoryId={self.props.subcategoryId}
              searchPhrase={self.props.searchPhrase}
              onSaleOnly={self.props.onSaleOnly}
              newOnly={!self.props.newOnly}>
              <a style={{ paddingLeft: '5px' }}>
              {self.props.newOnly ? 'Yes' : 'No'}
            </a>
          </SearchLink>
        </p>
      </div>
      </form>

      </div>
		)
	}
}

export default SearchBlock
