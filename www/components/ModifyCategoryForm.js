import { Component } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

class ModifyCategoryForm extends Component {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.state = {
      category: Object.assign({}, this.props.category)
    }
  }

  onSubmit(evt) {
    evt.preventDefault()
    if (this.props.onSubmit && typeof this.props.onSubmit == "function") {
      this.props.onSubmit({
        title: this.state.category.title,
        comments: this.state.category.comments,
      })
    }
  }

  render() {
    return <Form onSubmit={this.onSubmit}>
      <Form.Group controlId="ModifyCategoryForm-title">
        <Form.Label>Title</Form.Label>
        <Form.Control
          value={this.state.category.title || ''}
          onChange={() => this.setState({ category: Object.assign({}, this.state.category, { title: event.target.value })})}
           />
      </Form.Group>
      <Form.Group controlId="ModifyCategoryForm-title">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          value={this.state.category.comments || ''}
          onChange={() => this.setState({ category: Object.assign({}, this.state.category, { comments: event.target.value })})}
           />
      </Form.Group>
      <div style={{ marginTop: '16px' }}>
        <Button variant="primary" type="submit">
          <>{ this.props.saveLabel || 'Save' }</>
        </Button>
      </div>
    </Form>
  }
}

export default ModifyCategoryForm
