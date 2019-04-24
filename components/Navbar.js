import Link from 'next/link'

const Navbar = () => (
  <div id="globalNav" className="droplinetabs">
    <ul>
	  <li><Link href="/"><a ><span>Home</span></a></Link></li>
	  <li><a href="Newsletters/newsletter.cfm"><span>Newsletter</span></a>
	    <ul>
  	      <li><a href="Newsletters/newsletter.cfm">Current</a></li>
 	      <li><a href="Newsletters/newsletter-signup.cfm">Subscribe</a></li>
	    </ul>
	  </li>
	  <li><a href="ShoppingInfo/how2order.cfm"><span>Shopping&nbsp;Info</span></a>
	    <ul>
		  <li><a href="ShoppingInfo/how2order.cfm">How to Order</a></li>
		  <li><a href="ShoppingInfo/paymentOptions.cfm">Payment Options</a></li>
		  <li><a href="ShoppingInfo/orderform.htm">Order Form (Online orders preferred)</a></li>
		</ul>
	  </li>
	  <li><a href="ShippingInfo/shipping.cfm"><span>Shipping&nbsp;Info</span></a>
	    <ul>
  	      <li><a href="ShippingInfo/shipping.cfm">USA</a></li>
 	      <li><a href="ShippingInfo/shipping.cfm#canada">Canada</a></li>
	      <li><a href="ShippingInfo/shipping.cfm#international">International</a></li>
	      <li><a href="ShippingInfo/shipping.cfm#processing">Order Processing</a></li>
	    </ul>
	  </li>
	  <li><a href="Policies/Policies.cfm"><span>Policies</span></a>
	    <ul>
  	      <li><a href="Policies/Policies.cfm">Return Policy</a></li>
  	      <li><a href="Policies/Policies.cfm#cancellation">Cancellation Policy</a></li>
 	      <li><a href="Policies/Policies.cfm#privacy">Privacy Policy</a></li>
	      <li><a href="Policies/Policies.cfm#security">Security Policy</a></li>
	    </ul>
	  </li>
	  <li><a href="About/About.cfm"><span>About Us</span></a>
	    <ul>
		  <li><a href="About/About.cfm">History</a></li>
		  <li><a href="About/Contact.cfm">Contact</a></li>
		</ul>
	  </li>
	</ul>
  </div>
)

export default Navbar
