import React from "react"
import { Query } from 'react-apollo'
import Loader from 'react-loaders'
import gql from 'graphql-tag'

const numberItems = gql`
query {
  allProducts {
    total
  }
}
`

class SearchBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
   this.setState({value: event.target.value});
 }

 handleSubmit(event) {
   event.preventDefault()
   if (this.state.value && this.state.value.length >= 2) {
     document.location.href = `/search?searchPhrase=${this.state.value}`
   }
 }

 render() {
   return (
     <div id="search">
       <form style={{ marginBottom: '10px' }} onSubmit={this.handleSubmit}>
       <Query query={numberItems}>
         {({ loading, error, data }) => {
           if (loading) return <label>Search our 45700 item online catalog.</label>
             return <label>Search our {data.allProducts.total} item online catalog.</label>
           }}
         </Query>
         <input type="text" name="KeyWords" size="15" maxLength="60" value={this.state.value} onChange={this.handleChange} />
         <input type="submit" value="Go" />
       </form>
     </div>
   )
 }
}

export default SearchBlock
