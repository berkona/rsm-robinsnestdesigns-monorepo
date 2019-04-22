import Link from 'next/link'

const Navbar = () => (
  <div id="globalNav" className="droplinetabs">
    <ul>
      <li>
        <Link href="/"><a><span>Home</span></a></Link>
      </li>
    </ul>
  </div>
)

export default Navbar
