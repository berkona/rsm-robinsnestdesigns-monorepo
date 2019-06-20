import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { SearchLinkStr } from './Links'
import { withRouter } from 'next/router'
import Link from 'next/link'

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

const BreadcrumbItem = Breadcrumb.Item

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
        <BreadcrumbItem href={SearchLinkStr({ searchPhrase, onSaleOnly, newOnly })} active={!categoryId && !subcategoryId && !searchPhrase}>All categories</BreadcrumbItem>
        {
          categoryId
          ?
           <Query query={findCategory}>
             {({ loading, error, data }) => {
               const category = (loading || error)
                ? { title: '' + categoryId }
                : data.allCategories.reduce((accum, next) => next.id == categoryId ? next : accum, { title: '' + categoryId })
               return <BreadcrumbItem href={SearchLinkStr({ searchPhrase, categoryId, onSaleOnly, newOnly })} active={!subcategoryId && !searchPhrase}>{category.title}</BreadcrumbItem>
             }}
           </Query>
          : <></>
        }
        {
         (categoryId && subcategoryId)
         ? <Query query={findSubcategory} variables={{ categoryId }}>
            {
              ({ loading, error, data }) => {
                const subcategory = (loading || error)
                  ? { title: '' + subcategoryId }
                  : data.allSubcategories.reduce((accum, next) => next.id == subcategoryId ? next : accum, { title: '' + subcategoryId })
                return <BreadcrumbItem href={SearchLinkStr({ searchPhrase, categoryId, subcategoryId, onSaleOnly, newOnly })} active={!searchPhrase && !product}>{subcategory.title}</BreadcrumbItem>
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
