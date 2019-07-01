import Head from 'next/head'

export default (props) => (
  <>
    <Head>
      <meta name="og:site_name" content="Robin's Nest Designs" />
      <meta name="og:image" content="https://beta.robinsnestdesigns.com/static/rnd-framed-v3.gif" />
      { props.title
        ? <>
            <title>{ props.title + ' | Robin\'s Nest Designs' }</title>
            <meta name="og:title" content={props.title} />
          </>
        : undefined
      }
      { props.description
        ? <>
            <meta name="description" content={ props.description } />
            <meta name="og:description" content={props.description} />
          </>
        : undefined
      }
      { props.keywords
        ? <meta name="keywords" content={ props.keywords } />
        : undefined
      }
    </Head>
    <h1 style={{ display: 'none' }}>{props.title}</h1>
  </>
)
