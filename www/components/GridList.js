import React from "react"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default ({ items, children }) => <div className="grid-list">
  <Row>
    <style jsx global>{`
      .grid-list .grid-col {
        margin-bottom: 16px;
      }
    `}</style>
    {items && Array.isArray(items) ? items.map((item, idx) =>
      <Col key={item.id || idx}
           className="grid-col"
           sm={12} md={6}
           lg={4}>
           {children(item)}
      </Col>
    ) : <></>}
  </Row>
</div>
