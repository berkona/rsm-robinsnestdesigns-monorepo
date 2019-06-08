import Dropdown from 'react-bootstrap/Dropdown'
import { withRouter } from 'next/router'
import { SearchLinkStr } from './Links'

const sortQueryMapping = {
  'relevancy': 'Relevance',
  'mostRecent': 'Most Recent',
  'priceAsc': 'Price (low to high)',
  'priceDesc': 'Price (high to low)',
  'alpha': 'Alphabetic',
}

const SortWidget = (props) => (
  <div style={{ display: 'flex', flexDirection: 'row', marginRight: '15px' }}>
    <div style={{
      padding: ".25rem .5rem",
      fontSize: ".875rem",
      lineHeight: "1.5"
    }}>Sort by:</div>
    <Dropdown>
      <Dropdown.Toggle variant="light" size="sm">
        {sortQueryMapping[props.router.query.sortOrder] || sortQueryMapping['relevancy']}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {
          Object.keys(sortQueryMapping).map((sortKey) => (
            <Dropdown.Item key={sortKey} href={SearchLinkStr(Object.assign({}, props.router.query, { sortOrder: sortKey }))}>{sortQueryMapping[sortKey]}</Dropdown.Item>
          ))
        }
      </Dropdown.Menu>
    </Dropdown>
  </div>
)

export default withRouter(SortWidget)
