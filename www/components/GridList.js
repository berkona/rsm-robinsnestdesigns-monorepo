import React from "react"
import CardColumns from 'react-bootstrap/CardColumns'

export default ({ items, children }) => <div className="grid-list">
  <style jsx>{`
    .grid-list {
      margin-top: 16px;
    }
  `}</style>
  <CardColumns>
    {items && Array.isArray(items) ? items.map(item => children(item)) : <></>}
  </CardColumns>
</div>
