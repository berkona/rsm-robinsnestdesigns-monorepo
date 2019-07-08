const SiteInfo = () => (
  <div id="siteInfo">
    <p>
    This site provides the onilne catalog for Robin's Nest Designs listing cross stitch charts (Mirabilia,
    Nora Corbett, Lavender and Lace, John Clayton), needlepoint canvases, crochet, knitting, quilting books,
    russian punchneedle embroidery designs, tapestry needles from John James &amp; Mary Arden, embroidery floss
    by DMC &amp; Anchor, Hand dyed threads (Caron, Crescent Colours, Weeks Dye Works, Gentle Arts Sampler Threads),
    Silk threads, Glissen Gloss threads, Rainbow Gallery threads, Kreinik metallic threads, Mill Hill beads,
    cross stitch kits, fabrics from Charles Craft, Zweigart &amp; Wichelt Imports (linen, Aida, Lugana, Jubilee,
    Jobelan, etc.), Hand dyed fabrics (Crossed Wing Collection, Picture This Plus, Polstitches, &amp; Stoney Creek),
    afghans, placemats, towels, bookmarks, baby bibs and much more! Essentially everything you need to create
    collectible crafts and keepsakes of heirloom quality to give as gifts or decorate your home for everyday use
    or for Christmas!

    Items are subject to availability, and prices are subject to change without notice.
    </p>
    <div id="footer">
        <div id="footerLeft">
          Copyright 1996-{new Date().getFullYear()} ©<br></br>Robin Monroe
        </div>
        <div id="footerCenter">
          Send questions and comments about needlework products to: robin@robinsnestdesigns.com<br></br>
          Send questions and comments about the web site to: webmaster@pegweb.com
        </div>
        <div id="footerRight">Site last modified: {new Date().getMonth()+1}/{new Date().getDate()}/{new Date().getFullYear()}</div>
    </div>
  </div>
)

export default SiteInfo
