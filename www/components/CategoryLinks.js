import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { SearchLink, CategoryLink } from './Links'
import { withRouter } from 'next/router'

export const sidebarQuery = gql`
  query {
    allProducts {
      categories {
        id
        title
      }
    }
  }
`

const arrangeCategories = (categories) => {
  var categoryPrefixes = {}
  categories.forEach((e) => {
    let [ prefix, suffix ] = e.title.split('-')
    if (!prefix || !suffix) return
    e.suffix = suffix
    if (!categoryPrefixes[prefix]) categoryPrefixes[prefix] = []
    categoryPrefixes[prefix].push(e)
  })
  var sortedCategories = []
  for (var prefix in categoryPrefixes) {
    sortedCategories.push({
      prefix,
      children: categoryPrefixes[prefix].sort((a, b) => a.suffix < b.suffix ? -1 : a.suffix > b.suffix ? 1 : 0),
    })
  }
  sortedCategories.sort((a, b) => a.prefix < b.prefix ? -1 : a.prefix > b.prefix ? 1 : 0)
  return sortedCategories
}

const CategoryLinks_inner = (props) => (
  <div id="categories">
    <ul>
    {
      props.sortedCategories.map((prefixObj) => (
        <li key={`sidebar-super-category-${prefixObj.prefix}`}
            className="subcategory"
            style={{ fontSize: '16px' }}>
          {prefixObj.prefix}
          <ul>
            { prefixObj.children.map(c => (
                <li key={`sidebar-category-${c.id}`}>
                  {
                    props.useCategoryLinks
                    ? <CategoryLink categoryId={c.id}>
                        <a style={{ fontSize: '16px' }}>{c.suffix}</a>
                      </CategoryLink>
                    : <SearchLink categoryId={c.id}
                      searchPhrase={props.searchPhrase}
                      onSaleOnly={props.onSaleOnly}
                      newOnly={props.newOnly}
                      >
                        <a style={{ fontSize: '16px' }}>{c.suffix}</a>
                    </SearchLink>
                  }
                </li>
              )
            )}
          </ul>
        </li>
      ))
    }
    </ul>
  </div>
)

const CategoryLinks = withRouter((props) => (
  props.categories ? <CategoryLinks_inner
    useCategoryLinks={props.useCategoryLinks || false}
    sortedCategories={arrangeCategories(props.categories)}
    searchPhrase={props.router.query.searchPhrase}
    onSaleOnly={props.router.query.onSaleOnly}
    newOnly={props.router.query.newOnly}
  /> :
  <Query query={sidebarQuery}>
    {({ loading, error, data }) => {
      if (loading) return <div>Loading sidebar...</div>
      if (error) return <div>Error fetching data: <p>{error.toString()}</p></div>
      return <CategoryLinks_inner
        useCategoryLinks={props.useCategoryLinks || false}
        sortedCategories={arrangeCategories(data.allProducts.categories)}
        searchPhrase={props.router.query.searchPhrase}
        onSaleOnly={props.router.query.onSaleOnly}
        newOnly={props.router.query.newOnly}
      />
     }}
  </Query>
))


export default CategoryLinks
