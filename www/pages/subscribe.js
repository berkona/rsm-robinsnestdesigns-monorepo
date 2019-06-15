import React from 'react'
import MailchimpSubscribe from "react-mailchimp-subscribe"
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const mailchimpUrl = "https://robinsnestdesigns.us10.list-manage.com/subscribe/post?u=a40afd248779cabb18bc9e150&amp;id=ee8f35f684"

// a basic form
const CustomForm = ({ status, message, onValidated }) => {
  let email, name;
  const submit = () =>
    email &&
    name &&
    email.value.indexOf("@") > -1 &&
    onValidated({
      EMAIL: email.value,
      NAME: name.value
    });

  return (
    <Form
      onSubmit={() => { event.preventDefault(); submit() }}
    >
      {status === "sending" && <div style={{ color: "blue" }}>sending...</div>}
      {status === "error" && (
        <div
          style={{ color: "red" }}
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
      {status === "success" && (
        <div
          style={{ color: "green" }}
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control placeholder="Your name" ref={node => (name = node)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control   placeholder="Your email" ref={node => (email = node)} />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default (props) => (
    <Col>
      <div style={{ padding: '16px' }}>
        <h1>Subscribe to the Newletter</h1>
        <p>Use the form below to subscribe to our newsletter and get the latest news and deals</p>
        <hr />
        <MailchimpSubscribe
          url={mailchimpUrl}
          render={({ subscribe, status, message }) => (
            <CustomForm
              status={status}
              message={message}
              onValidated={formData => subscribe(formData)}
            />
          )}
        />
      </div>
    </Col>
)
