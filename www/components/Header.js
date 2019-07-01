import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Link from 'next/link'
import { FaShippingFast } from 'react-icons/fa'

const Header = () => (
  <Row id="header">
    <Col id="logo">
      <Link href="/">
        <a>
          <img src="/static/rnd-framed-v3.gif" alt="Robin's Nest Designs Logo" width="520" height="145" id="logo" />
        </a>
      </Link>
    </Col>
    <Col id="siteName">
      <h3 style={{ marginBottom: '6px', marginTop: '16px', color: '#FFFFFF', fontWeight: 'bold', fontSize: '120%', padding: '6px 0 12px 0' }}>
        Your Online Shop for Everything Needlework!
      </h3>
      <h3 style={{ color: '#FFF', fontWeight: 'bold', fontSize: '24px' }}>
        <FaShippingFast /> Free Shipping On US Orders Over $75!
      </h3>
    </Col>
  </Row>
)

export default Header
