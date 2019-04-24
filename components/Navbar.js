import Link from 'next/link'

const Navbar = () => (
  <div id="globalNav" className="droplinetabs">
    <ul>
	  <li><Link href="/"><a ><span>Home</span></a></Link></li>
	  <li><a href="/Newsletters/newsletter"><span>Newsletter</span></a>
	    <ul>
  	      <li><a href="/Newsletters/newsletter">Current</a></li>
 	      <li><a href="/Newsletters/newsletter-signup">Subscribe</a></li>
	    </ul>
	  </li>
	  <li><a href="/ShoppingInfo/how2order"><span>Shopping&nbsp;Info</span></a>
	    <ul>
		  <li><a href="/ShoppingInfo/how2order">How to Order</a></li>
		  <li><a href="/ShoppingInfo/paymentOptions">Payment Options</a></li>
		  <li><a href="/static/orderform.htm">Order Form (Online orders preferred)</a></li>
		</ul>
	  </li>
	  <li><a href="/ShippingInfo/shipping"><span>Shipping&nbsp;Info</span></a>
	    <ul>
  	      <li><a href="/ShippingInfo/shipping">USA</a></li>
 	      <li><a href="/ShippingInfo/shipping#canada">Canada</a></li>
	      <li><a href="/ShippingInfo/shipping#international">International</a></li>
	      <li><a href="/ShippingInfo/shipping#processing">Order Processing</a></li>
	    </ul>
	  </li>
	  <li><a href="/Policies/Policies"><span>Policies</span></a>
	    <ul>
  	      <li><a href="/Policies/Policies">Return Policy</a></li>
  	      <li><a href="/Policies/Policies#cancellation">Cancellation Policy</a></li>
 	      <li><a href="/Policies/Policies#privacy">Privacy Policy</a></li>
	      <li><a href="/Policies/Policies#security">Security Policy</a></li>
	    </ul>
	  </li>
	  <li><a href="/About/About"><span>About Us</span></a>
	    <ul>
		  <li><a href="/About/About">History</a></li>
		  <li><a href="/About/Contact">Contact</a></li>
		</ul>
	  </li>
	</ul>
  </div>
)

export default Navbar
