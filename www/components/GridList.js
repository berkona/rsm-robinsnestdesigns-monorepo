import React from "react"
import CardColumns from 'react-bootstrap/CardColumns'

export default ({ items, children }) => <div className="grid-list">
  <CardColumns>
    {items && Array.isArray(items) ? items.map(item => children(item)) : <></>}
  </CardColumns>
</div>
