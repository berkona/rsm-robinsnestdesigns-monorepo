import React from 'react'
import Link from 'next/link'
import { PageViewEvent } from '../../lib/react-ga'

const PaymentOptionsPage = (props) => (
  <div style={{ padding: "5px 20px 20px 20px" }} className="twoColumns">
  <PageViewEvent />
  <h1>Payment Options</h1>
  <p><a href="https://www.paypal.com/us/verified/pal=rsmonroe22@gmail.com" target="_blank"><img src="http://www.paypal.com/en_US/i/icon/verification_seal.gif" alt="Official PayPal Seal" border="0" /></a><img src="/static/horizontal_solution_PPeCheck.gif" width="253" height="80" /></p>
  <p>We are a verified PayPal merchant accepting the above forms of payment. You do not need a PayPal account to pay. We also accept money orders. </p>
  <blockquote>
    <p> Online, you have three options for paying:</p>
    <ol>
      <li>Log into your PayPal account. You can use your MC, VISA, Discover, AMEX, bank transfers, echecks, or debit cards</li>
      <li>Under the link "Don't have a PayPal account," enter your MC, VISA, Discover, or AMEX directly if you do not have a PayPal account. </li>
      <li>Also under the link "Don't have a PayPal account," choose Bill Me Later®.</li>
      </ol>
    </blockquote>
  <p>If for whatever reason your payment does not go through, you can get back to the payment area by clicking on the link in your "Thank You" email. The link you need is located under the text, "Please
    note: If you have not already done so upon checkout, we have provided a
    link below..." </p>
  <blockquote>
      <p>By phone, you have two options for paying: </p>
      <ol>
          <li>We will send you an invoice through PayPal. Then you have options 1 and 2 above. </li>
          <li>Mail in a money order to Robin's Nest Designs; 6303 Craig Rd; Durham, NC 27712.</li>
      </ol>
  </blockquote>
  <p> We use rsmonroe22@gmail.com for PayPal.</p>
  <p>Sorry, we do not accept personal checks. </p>
  <p>Payments for needlework supplies must be received prior to shipment of those supplies.</p>
   </div>
)

export default PaymentOptionsPage
