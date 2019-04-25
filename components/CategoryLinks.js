import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { SearchLink } from './Links'
import { withRouter } from 'next/router'

export const sidebarQuery = gql`
  query {
    allCategories {
      id
      title
    }
  }
`

const CategoryLinks = withRouter((props) => (
  <Query query={sidebarQuery}>
    {({ loading, error, data }) => {
      if (loading) return <div>Loading sidebar...</div>
      if (error) return <div>Error fetching data: <p>{error.toString()}</p></div>
      var categoryPrefixes = {}
      data.allCategories.forEach((e) => {
        let [ prefix, suffix ] = e.title.split('-')
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

      return (
        <div id="categories">
          <ul>
          {
            sortedCategories.map((prefixObj) => (
              <li className="subcategory" key={`sidebar-super-category-${prefixObj.prefix}`}>
                {prefixObj.prefix}
                <ul>
                  { prefixObj.children.map(c => (
                      <li key={`sidebar-category-${c.id}`}>
                        <SearchLink categoryId={c.id}
                          searchPhrase={props.router.query.searchPhrase}>
                          <a>{c.suffix}</a>
                        </SearchLink>
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
     }}
  </Query>
))


export default CategoryLinks
