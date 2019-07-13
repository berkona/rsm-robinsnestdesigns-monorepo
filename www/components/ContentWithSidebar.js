import React from 'react'
import Col from 'react-bootstrap/Col'
import SidebarDefault from './SidebarDefault'

export default ({ children }) => <>
  <Col className="d-none d-sm-block" sm={4} md={3}>
    <SidebarDefault />
  </Col>
  <Col id="content" xs={12} sm={8} md={9}>
    {children}
  </Col>
</>
