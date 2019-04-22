import SubcategoryGrid from '../components/SubcategoryGrid'

import { withRouter } from 'next/router'

const Category = withRouter((props) => (
  <SubcategoryGrid categoryId={props.router.query.categoryId} />
))

export default Category
