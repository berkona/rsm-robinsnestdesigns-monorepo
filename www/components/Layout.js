import React from 'react'
import Head from 'next/head'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Header from './Header'
import Navbar from './Navbar'
import SiteInfo from './SiteInfo'

import SiteCSS from '../styles/site'
import ReactDatepickerCSS from '../styles/react-datepicker'
import NProgressCSS from '../styles/nprogress'

import { FAVICON_URL } from '../constants/config'

const Layout = props => (
  <>

  {/* setup default Head (children can override) */}
  <Head>
    <title>Exclusive needlework charts and kits for cross stitch and needlepoint | Robin's Next Designs</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="author" content="Robin S. Monroe" />
    <meta name="description" content="Needlework designs, kits, fabric, floss and accessories for cross stitch, needlepoint and punchneedle" />
    <meta name="keywords" content="cross,stitch,needlepoint,quilting,punchneedle,patterns,charts,graphs,needles,DMC,Anchor,Mill,Hill,Pearl,perle,cotton,beads,floss,kits,linen,Aida,Lugana,evenweave,afghans,tabletop,placemats,napkins,bread,covers,cloths,Jubilee,Jobelan,Wichelt,Zweigart,Charles,Kreinik,metallic,threads,Marlitt,Lavender,Lace,Mirabilia,Butternut,Road,nora,Corbett,Marilyn,Imblum,Pooh,Disney,John,James,Piecemakers,tapestry,beading,baby,bibs,towels,bookmark,fabrics,leaflets,books,needlework,stitchery,needlearts,sewing,crafts,keepsakes,collectibles,heirloom,gifts,home,decor,furnishings,flowers,Christmas,ornaments,cats,dogs" />
    <meta httpEquiv="PICS-Label" content="(PICS-1.0 &quot;http://www.rsac.org/ratingsv01.html&quot; l gen true comment &quot;RSACi North America Server&quot; by &quot;robndesign@aol.com&quot; for &quot;http://www.stitching.com/robinsnest/&quot; on &quot;1997.03.09T11:03-0500&quot; exp &quot;1997.07.01T08:15-0500&quot; r (n 0 s 0 v 0 l 0))" />
    <link rel='shortcut icon' href={FAVICON_URL} type="image/x-icon" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
  </Head>

  {/* global styles */}
  <SiteCSS />
  <NProgressCSS />
  <ReactDatepickerCSS />

  <Container fluid id="page_border">
  
    <Row id="masthead" className="d-none d-sm-block" noGutters={true}>
      <Header />
    </Row>

    <Row noGutters={true}>
      <Col>
        <Navbar />
      </Col>
    </Row>

    <Row noGutters={true}>
      <Col>
        <Container fluid id="page_border_inner">
          <Row>
            {props.children}
          </Row>
          <Row>
            <Col>
              <SiteInfo />
            </Col>
          </Row>
        </Container>
      </Col>
    </Row>
  </Container>
  </>
)

export default Layout
