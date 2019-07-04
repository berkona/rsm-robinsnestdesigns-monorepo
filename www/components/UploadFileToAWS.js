import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import {CurrentUserContext } from '../lib/auth'
import { NO_IMAGE_URL } from '../constants/config'

const SIGN_URL_REQ = gql`
mutation($token: String!, $fileName: String!, $fileType: String!) {
  requestSignedUrl(token: $token, fileName: $fileName, fileType: $fileType) {
    signedUrl
    publicUrl
  }
}
`
class UploadFileToAWS extends Component {
  constructor(props){
    super(props);
    this.state = {
      success : false,
      url : ""
    }
  }

  handleChange = (ev) => {
    this.setState({success: false, url : ""});
  }

  render() {
    const self = this
    return (
      <>
      <Form.Group controlId={this.props.controlId}>
        <Form.Label>{this.props.label}</Form.Label>
        <div style={{ marginBottom: '10px', height: '240px' }}>
          <img style={{ maxWidth: '100%', maxHeight: '100%', }} src={this.props.value || NO_IMAGE_URL} />
        </div>
        <Form.Control onChange={this.handleChange} ref={(ref) => { self.uploadInput = ref; }} type="file" accept=".gif,.jpg,.jpeg,.png" />
        { this.state.success && <Form.Text>
          <a href={self.state.url}>File uploaded</a>
        </Form.Text>
        }
        { this.state.error && <Form.Text>
          {this.state.error.toString()}
        </Form.Text>
        }
      </Form.Group>
      <CurrentUserContext.Consumer>
      {currentUser => (
        <Mutation mutation={SIGN_URL_REQ} variables={{ token: currentUser.getToken() }}>
          {(mutationFn, { loading, error, data }) => {
            return <Button variant="outline-primary" onClick={() => {
              let file = self.uploadInput.files[0];
              this.setState({ loading: true, success: false, error: null, })
              mutationFn({ variables: { fileName: file.name, fileType: file.type }})
                .then(response => {
                  const { data } = response
                  const { signedUrl, publicUrl } = data.requestSignedUrl
                  return fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    mode: 'cors',
                  })
                  .then((response) => {
                    if (!response.ok) {
                      self.setState({ loading: false, error: 'Upload failed', })
                    } else {
                      self.setState({ loading: false, success: true, url: publicUrl })
                      if (this.props.onChange) {
                        this.props.onChange(publicUrl)
                      }
                    }
                  })
              })
              .catch((err) => {
                console.log('error', err)
                self.setState({ loading: false, error: err.toString() })
              })
            }} disabled={self.state.loading || !self.uploadInput || !self.uploadInput.files || self.uploadInput.files.length !== 1}>Upload File</Button>
          }}
        </Mutation>
      )}
      </CurrentUserContext.Consumer>
      </>
    );
  }
}

export default UploadFileToAWS;
