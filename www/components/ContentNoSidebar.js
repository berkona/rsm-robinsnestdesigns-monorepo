import React from 'react'
import Col from 'react-bootstrap/Col'

export default ({ children }) => <>
  <Col id="content" xs={12} sm={8} md={9}>
    {children}
  </Col>
</>
