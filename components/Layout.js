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
      {/* Import CSS for nprogress */}
      <link rel='stylesheet' type="text/css" href="/static/loaders.min.css" />
      <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
      {/* CSS for robinsnestdesigns */}
      <link rel='stylesheet' type='text/css' href='/static/site.css' />
    </Head>
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
