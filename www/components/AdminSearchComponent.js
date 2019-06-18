import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

class AdminComponent extends React.Component {
  constructor(props) {
    super(props)
    this.reloadData = this.reloadData.bind(this)
    this.state = {
      newSearchPhrase: '',
      searchPhrase: '',
    }
  }

  reloadData() {
    console.log('reloadData', this.state)
    event.preventDefault()
    this.setState({ searchPhrase: this.state.newSearchPhrase })
  }

  render() {
    return <>
    <Form onSubmit={this.reloadData}>
      <Form.Group controlId="adminSearchBar">
        <Form.Label>Search</Form.Label>
        <Form.Control value={this.state.newSearchPhrase} onChange={() => this.setState({ newSearchPhrase: event.target.value })}/>
      </Form.Group>
      <Button variant="dark" type="submit">
      Search
      </Button>
    </Form>
    <hr />
    {this.props.children(this.state.searchPhrase)}
    </>
  }
}

export default AdminComponent
