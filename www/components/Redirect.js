import React from 'react'
import Router from 'next/router'

class Redirect extends React.Component {
  componentDidMount() {
    Router.push(this.props.href)
  }
  render() {
    return this.props.children ? <div>{this.props.children}</div> : this.props.message ? <p>{this.props.message}</p> : <p>Redirecting you.  Please wait.</p>
  }
}

export default Redirect
