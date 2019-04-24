import Head from 'next/head'

import Header from './Header'
import CategoryLinks from './CategoryLinks'
import Navbar from './Navbar'
import SiteInfo from './SiteInfo'
import SearchBlock from './SearchBlock'
import TopLinks from './TopLinks'

const Layout = props => (
  <div id="page_border">
    <Head>
      <title>Robin's Nest Designs: Exclusive needlework charts and kits for cross stitch and needlepoint</title>
      <meta name="Author" content="Robin S. Monroe" />
      <meta name="Description" content="Needlework designs, kits, fabric, floss and accessories for cross stitch, needlepoint and punchneedle" />
      <meta name="KeyWords" content="cross,stitch,needlepoint,quilting,punchneedle,patterns,charts,graphs,needles,DMC,Anchor,Mill,Hill,Pearl,perle,cotton,beads,floss,kits,linen,Aida,Lugana,evenweave,afghans,tabletop,placemats,napkins,bread,covers,cloths,Jubilee,Jobelan,Wichelt,Zweigart,Charles,Kreinik,metallic,threads,Marlitt,Lavender,Lace,Mirabilia,Butternut,Road,nora,Corbett,Marilyn,Imblum,Pooh,Disney,John,James,Piecemakers,tapestry,beading,baby,bibs,towels,bookmark,fabrics,leaflets,books,needlework,stitchery,needlearts,sewing,crafts,keepsakes,collectibles,heirloom,gifts,home,decor,furnishings,flowers,Christmas,ornaments,cats,dogs" />
      <meta httpEquiv="PICS-Label" content="(PICS-1.0 &quot;http://www.rsac.org/ratingsv01.html&quot; l gen true comment &quot;RSACi North America Server&quot; by &quot;robndesign@aol.com&quot; for &quot;http://www.stitching.com/robinsnest/&quot; on &quot;1997.03.09T11:03-0500&quot; exp &quot;1997.07.01T08:15-0500&quot; r (n 0 s 0 v 0 l 0))" />

      <link rel='shortcut icon' href="/static/favicon.ico" type="image/x-icon" />

      {/* Import CSS for nprogress */}
      <link rel='stylesheet' type="text/css" href="/static/loaders.min.css" />
      <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
      {/* CSS for robinsnestdesigns */}
      <link rel='stylesheet' type='text/css' href='/static/site.css' />
      <link href="/static/droplinetabs.css" rel="stylesheet" type="text/css" />
    </Head>
    <script type="text/javascript" src="/static/jquery-1.3.2.min.js"></script>
    <script type="text/javascript" src="/static/droplinemenu.js"></script>
    <div id="masthead">
      <Header />
      <Navbar />
    </div>
    <div id="page_border_inner">
      <div id="navBar">
        <SearchBlock />
        <TopLinks />
        <CategoryLinks />
      </div>
      <div id="content" className="codePage">
        {props.children}
      </div>
      <SiteInfo />
    </div>
  </div>
)

export default Layout
