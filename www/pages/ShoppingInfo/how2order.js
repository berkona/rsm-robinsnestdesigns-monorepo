import React from 'react'
import Link from 'next/link'
import { PageViewEvent } from '../../lib/react-ga'

const HowToOrder = (props) => (
  <div style={{ padding: "5px 20px 20px 20px" }} className="twoColumns">
<PageViewEvent />
<h1>How to Order</h1>

<p>It's so easy to order from <Link href="../"><a><b><i>Robin's
Nest Designs!</i></b></a></Link></p>

<p>Here are the different ways you can order from us:</p>
<blockquote>
  <p>We prefer you use our Online Shopping cart. If the item is available in the online shopping cart system,
          please press the button "add to cart", and follow
          the directions on how to order securely with your credit card
          or PayPal. If you would also like to order an item not on the
          shopping cart system, please fill in the comments area on the
        shopping cart's order form.</p>
  <p>You may also contact Robin Monroe by e-mail (<a href="mailto:robin@robinsnestdesigns.com">robin@robinsnestdesigns.com</a>),
          voice phone<strong>*</strong> (919-471-6576), or snail mail (<Link href="/orderform"><a>order
          form</a></Link>).
          Specify what you would like to order. We will send you an invoice through PayPal. You do not need a PayPal account to pay, but we will need your email address for invoicing. If not in stock, most items
          can be<a href="#Faster-Service"> ordered quickly.</a><strong>**</strong></p>
  <p>        You can order via the US Postal Service. You can use the printable <Link href="/orderform"><a>order form</a></Link>, please send the money order with it to the <a href="#Address">address</a> below. If you are not able to print the order form, please include
          a hand written note with your money order. Please include your name,
          mailing address for shipping purposes, billing address if different
          from your shipping address, and any contact information (i.e.
          voice phone number, fax number, and e-mail address). We do not accept personal checks. </p>
  </blockquote>

<p><strong>*</strong> The best possible times to reach Robin by phone are 12 Noon to 4:00 PM M-F. If you call in your order and get voice mail, please leave
      a message with your name and phone number, and Robin will return
      your call as soon as possible. Voice mail will pick up when we
      are already on the phone.</p>
<p><strong>**</strong> Please note: All special orders must be paid for in advance
        prior to our placing the order for you with our distributors.
        This keeps our costs down so we can continue to offer you many sales and free shipping on
        orders over $75.</p>
<p>If you have any questions, please <a href="mailto:robin@robinsnestdesigns.com">contact
us</a>! We would be happy to answer any question.</p>

<h1><a name="Faster-Service" id="Faster-Service"></a>For
Faster Service</h1>

<p><font color="#000000">We carry over 40,000 items! Let's
be reasonable. We can't possibly stock all items at all times.
We do stock the more popular ones. To help us serve you better,
orders placed by Tuesday at 12 PM ET can generally be shipped on Friday
or Saturday. Most of our distributors ship to us in 2-3 days.
We will also have our distributors ship directly to you depending
on the circumstances. We try our very best to get your order to
you as fast as possible. </font></p>
<p><font color="#000000">If you have special timing needs, please
  let us know when you place the order either by phone, email or
  putting a note in the comments box on your order. Thank you for
  shopping at Robin's Nest Designs!</font></p>
<p><a href="#content"><font size="-1">Return to the top</font></a></p>

<h1><a name="Address"></a>Our Address</h1>

<p>If mailing your order, please
send your payment with your order (printable order form or note)
to:</p>

<ul>
  <p>Robin's Nest Designs<br></br>
  6303 Craig Road<br></br>
  Durham, NC 27712
</p></ul>

<p><a href="#content"><font size="-1">Return to the top</font></a></p>

</div>
)

export default HowToOrder
