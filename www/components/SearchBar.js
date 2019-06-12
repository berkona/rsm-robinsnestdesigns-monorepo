import React from 'react'

const Goto = (searchState, searchPhrase) => {
  Router.push(SearchLinkStr(Object.assign({}, searchState || {}, { searchPhrase })))
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchPhrase: props.searchPhrase,
      searchState: props.searchState,
    }

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSearchChange(event) {
		const self = this
		self.setState({
			searchPhrase: event.target.value,
		}, () => {
      if (props.searchOnType) {
  			if (self.searchTimeout) {
  				clearTimeout(self.searchTimeout)
  			}
  			self.searchTimeout = setTimeout(() => Goto(self.state.searchState, self.state.searchPhrase)), SEARCH_DELAY)
      }
		});
	}

	handleSubmit(event) {
		Router.push(SearchLinkStr(this.state))
	}
}
