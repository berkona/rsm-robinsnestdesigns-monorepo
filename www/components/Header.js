import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Link from 'next/link'

const Header = () => (
  <Row id="header">
    <Col id="logo">
      <Link href="/">
        <img src="/static/rnd-framed-v3.gif" alt="Robin's Nest Designs Logo" width="520" height="145" id="logo" />
      </Link>
    </Col>
    <Col id="siteName">
      <h1> Your Online Shop for Everything Needlework! </h1>
      <p>
       Phone: 919-471-6576 (M-F 12 pm to 4 pm Eastern Time)<br></br>
       Fax: 919-321-2964 (M-F 12 pm to 4 pm Eastern Time)<br></br>
       robin@robinsnestdesigns.com (24/7, preferred)<br></br>
      </p>
    </Col>
  </Row>
)

export default Header
