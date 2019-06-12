import Head from 'next/head'

export default (props) => (
  <Head>
    { props.title
      ? <title>{ props.title + ' | Robin\'s Nest Designs' }</title>
      : undefined
    }
    { props.description
      ? <meta name="description" content={ props.description } />
      : undefined
    }
    { props.keywords
      ? <meta name="keywords" content={ props.keywords } />
      : undefined
    }
  </Head>
)
