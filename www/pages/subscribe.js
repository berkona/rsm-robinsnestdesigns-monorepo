import React from 'react'
import MailchimpSubscribe from "react-mailchimp-subscribe"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import ContentWithSidebar from '../components/ContentWithSidebar'

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
    <ContentWithSidebar>
      <div style={{ padding: '16px' }}>
        <h1>Subscribe to the Newletter</h1>
        <p>Want to get notified of the latest sales and newest items? Then sign up for our newsletter and about once a week you will receive an email with this information from us. Sometimes you will receive a second email in a week to announce a special sale or event that occurred after the sending of the weekly email, and Robin was too excited about the news to wait to tell you!</p>

        <p>Robin's Nest Designs respects your privacy. We do not give out any information on our mailing list. All your information is strictly confidential and secure. This list is intended to keep you informed of sales and new items only.</p>

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
    </ContentWithSidebar>
)
