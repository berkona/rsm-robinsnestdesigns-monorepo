import React from 'react';
import scriptLoader from 'react-async-script-loader';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button'

const PAYPAL_CLIENT_ID = 'AfRXnOb4Weq93kfQLyPKfaW3e8bYvRbkDBoeTZwCPLcxdottjyLo5t00XxZteN6Up6bmYIKn-GRSUMg2';

class PaypalButton extends React.Component {

    constructor(props) {
        super(props)
        this.createButton = this.createButton.bind(this)
        this.createOrder = this.createOrder.bind(this)
        this.onApprove = this.onApprove.bind(this)
        this.state = {
          buttonObject: null,
        }
    }

    createButton() {
      this.setState({
        buttonObject: paypal.Buttons({
          createOrder: this.createOrder,
          onApprove: this.onApprove,
        })
      })
    }

    createOrder(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: this.props.total
          }
        }]
      })
    }

    onApprove(data, actions) {
      return actions.order.capture().then((details) => {
        // // TODO:
        console.log('Transaction complete' + details.payer.name.given_name);
      });
    }

    componentWillReceiveProps({ isScriptLoaded, isScriptLoadSucceed }) {
      if (isScriptLoaded && isScriptLoadSucceed && !this.state.buttonObject) {
        this.createButton()
      }
    }

    componentDidMount() {
      const { isScriptLoaded, isScriptLoadSucceed } = this.props;
      if (isScriptLoaded && isScriptLoadSucceed && !this.state.buttonObject) {
        this.createButton()
      }
    }

    render() {
      const html =  <div id="paypal-button-container"></div>
      if (this.state.buttonObject) {
        return this.state.buttonObject.render(html)
      } else {
        return <></>
      }
    }
}

PaypalButton.propTypes = {
    total: PropTypes.number.isRequired,
}

PaypalButton.defaultProps = {
    onSuccess: (payment) => {
        console.log('The payment was succeeded!', payment);
    },
    onCancel: (data) => {
        console.log('The payment was cancelled!', data)
    },
    onError: (err) => {
        console.log('Error loading Paypal script!', err)
    }
};

export default scriptLoader('https://www.paypal.com/sdk/js?client-id=' + PAYPAL_CLIENT_ID)(PaypalButton);
