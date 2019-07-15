import React from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'next/router'
import { SearchLink } from '../components/Links'
import GridList from '../components/GridList'
import ContentWithSidebar from '../components/ContentWithSidebar'
import { SUBCATEGORY_GET_ONE } from '../constants/queries'
import CategoryTeaser from '../components/CategoryTeaser'
import Loader from '../components/Loader'
import Breadcrumb from '../components/Breadcrumb'

export default withRouter(({ router }) => <ContentWithSidebar>
<Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: router.query.categoryId }}>
  {({ loading, error, data }) => (
    !data || !data.allSubcategories || !data.allSubcategories.length ? <Loader /> :
    <GridList items={data.allSubcategories}>
      {c => <CategoryTeaser category={c}>
          <SearchLink categoryId={router.query.categoryId}
                          subcategoryId={c.id}
                          sortOrder="mostRecent">
            <a>Browse items</a>
          </SearchLink>
        </CategoryTeaser>
      }
    </GridList>
  )
  }
</Query>
</ContentWithSidebar>)
