import { withRouter } from 'next/router'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Link from 'next/link'
import SubcategoryGrid from '../components/SubcategoryGrid'
import Loader from '../components/Loader'
import ProductList from '../components/ProductList'

const salesCategoriesQuery = gql`
{
  saleCategories {
    id
    title
  }
}
`

const OnSalePage = withRouter((props) => {
  if (!props.router.query.categoryId) {
    return (
      <Query query={salesCategoriesQuery}>
      {({ loading, error, data}) => {
        if (loading) return <Loader />
        if (error) return <div>Error fetching data {error.toString()}</div>
        return (
          <div id="onsale">
            <h1>Items on Sale</h1>
            <div align="CENTER"><h2>Choose a sale category below.</h2></div>
            <SubcategoryGrid categories={data.saleCategories}>
              {
                (item) => (
                  <Link href={`/on-sale?categoryId=${item.id}`}>
                    <a><font color="black"><span dangerouslySetInnerHTML={{__html: item.title}}></span></font></a>
                  </Link>
                )
              }
            </SubcategoryGrid>
          </div>
        )
      }}
      </Query>
    )
  } else {
    return (
      <div id="onsale">
        <h1>Items on Sale</h1>
        <ProductList categoryId={props.router.query.categoryId} onSaleOnly={true} page={props.router.query.pageNo} />
      </div>
    )
  }
})

export default OnSalePage
