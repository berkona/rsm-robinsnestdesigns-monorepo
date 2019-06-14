import { CategoryLink } from '../../components/Links'
const AboutStyle =  {
    width: "700px",
    margin: "0 0 0 0px",
    padding: "5px 20px 20px 20px",
    minHeight: "600px",
}

export default (props) => (
  <div style={AboutStyle} className="twoColumns">
  <h1>About Us </h1>
  <p><i><font color="#000099">Robin's Nest Designs</font> </i>has been gladly serving the stitchers of the Internet community since 1996 as a <a href="#Proud Member">proud member</a> of various Internet and needlework associations. We started off as a design studio creating our own Robin's Nest Originals and doing custom designs. With so many customers also wanting their special designs as kits, we started providing floss and fabric. We no longer do custom design work, but now Robin's Nest Designs is excited to offer the best selection in needlework supplies!</p>
  <p>Robin Monroe is the chief needlework designer, webmaster, and contact person for orders from <i><font color="#000099">Robin's Nest Designs</font></i><font color="#000000">. </font>She has been interested in some form of arts and crafts ever since she was little. Her mother introduced her to crochet at 10. She taught herself macrame and embroidery in high school. It was in graduate school when a friend first introduced her to cross stitch. It was love at first stitch!</p>
  <p>Today Robin enjoys combining her interest in computers with designing by creating her own designs and designing the web pages you are now surfing! She also enjoys running her needlework supply business where she can provide for all your stitching needs.</p>
  <p><i><font color="#000099">Robin's Nest Designs</font> </i>offers many of your <CategoryLink categoryId={12}><a>favorite designers</a></CategoryLink> including full lines of Lavender &amp; Lace, Mirabilia, Butternut Road, Pegasus (Marty Bell), Cross My Heart, Crossed Wing Collection, Green Apple Co. (Beatrix Potter), June Grigg Designs (P. Buckley Moss), Diane Graebner, Linda Myers, Lizzie Kate, and many, many others. We also carry a large assortment of <CategoryLink categoryId={26}><a>needles</a></CategoryLink> (John James gold and platinum, DMC, and Piecemakers), <CategoryLink categoryId={27}><a>Mill Hill beads</a></CategoryLink>, <CategoryLink categoryId={9}><a>Mill Hill kits</a></CategoryLink>, <CategoryLink categoryId={23}><a>Kreinik metallics</a></CategoryLink>,  <CategoryLink categoryId={10}><a>Zweigart</a></CategoryLink>, and  <CategoryLink categoryId={10}><a >Wichelt Imports</a></CategoryLink> (Permin) fabrics and  <CategoryLink categoryId={13}><a>prefinished items</a></CategoryLink>, such as towels, baby bibs, afghans, tablecloths, and more. We also carry many other  <CategoryLink categoryId={9}><a>cross stitch kits</a></CategoryLink>. If you don't see it, please ask. We would be delighted to special order for you!</p>
  <p>You can get just about everything you need from one place...<i><font color="#000099">Robin's Nest Designs</font> </i>where every stitcher is <i><font color="#000099">SPECIAL!</font></i></p>
  </div>
)
