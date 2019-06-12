import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { SearchLinkStr } from './Links'

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

const MakeBreadcrumbItem = (linkHref, linkText, isActive) => (
    isActive
    ? <Breadcrumb.Item active>{linkText}</Breadcrumb.Item>
    : <Breadcrumb.Item href={linkHref}>{linkText}</Breadcrumb.Item>
)

const MyBreadcrumb = (props) => {
    const {
      searchPhrase,
      categoryId,
      subcategoryId,
      onSaleOnly,
      newOnly,
      product,
    } = props.query;
    return (
      <Breadcrumb>
        {
          MakeBreadcrumbItem('/', 'All categories', !categoryId && !subcategoryId && !searchPhrase)
        }
        {
          categoryId
          ?
           <Query query={findCategory}>
             {({ loading, error, data }) => {
               const category = (loading || error)
                ? { title: '' + categoryId }
                : data.allCategories.reduce((accum, next) => next.id == categoryId ? next : accum, { title: '' + categoryId })
               return MakeBreadcrumbItem(SearchLinkStr({ categoryId, onSaleOnly, newOnly }), category.title, !subcategoryId && !searchPhrase)
             }}
           </Query>
          : <></>
        }
        {
         (categoryId && subcategoryId) ?
         <Query query={findSubcategory} variables={{ categoryId }}>
          {
            ({ loading, error, data }) => {
              const subcategory = (loading || error)
                ? { title: '' + subcategoryId }
                : data.allSubcategories.reduce((accum, next) => next.id == subcategoryId ? next : accum, { title: '' + subcategoryId })
              return MakeBreadcrumbItem(SearchLinkStr({ categoryId, subcategoryId, onSaleOnly, newOnly }), subcategory.title, !searchPhrase && !product)
            }
          }
         </Query>
         : <></>
         }
         { searchPhrase ? <Breadcrumb.Item active>"{searchPhrase}"</Breadcrumb.Item> : <></> }
         { product ? <Breadcrumb.Item active>{product.name}</Breadcrumb.Item> : <></> }
      </Breadcrumb>
    )
}

export default MyBreadcrumb
