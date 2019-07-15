export default () => (
<style jsx global>{`

  /***********************************************/
  /* 3col_leftNav.css                             */
  /* Use with template 3col_leftNav.html          */
  /***********************************************/
  /***********************************************/
  /* HTML tag styles                             */
  /***********************************************/
  body {
      font-family: Arial, sans-serif;
      color: #333333;
      line-height: 1.166;
      margin: 0px;
      padding: 0px;
      background-color: #8BA8BC;
      /*
  	background-image: url(images/greyBG.gif);
  */
  }

  a {
      color: #006699;
      text-decoration: none;
  }

  a:link {
      color: #006699;
      text-decoration: none;
  }

  a:visited {
      color: #006699;
      text-decoration: none;
  }

  a:hover {
      color: #006699;
      text-decoration: underline;
  }

  h1 {
      font-family: Verdana, Arial, sans-serif;
      font-size: 120%;
      color: #006699;
      margin: .5em 0;
      padding: 6px 0 12px 0;
  }

  h2 {
      font-family: Arial, sans-serif;
      font-size: 114%;
      color: #006699;
      margin: 0px;
      padding: 6px 0 12px 0;
  }

  h3 {
      font-family: Arial, sans-serif;
      font-size: 100%;
      color: #334d55;
      margin: .5em 0;
      padding: 0px;
  }

  h4 {
      font-family: Arial, sans-serif;
      font-size: 100%;
      font-weight: normal;
      color: #333333;
      margin: 0px;
      padding: 0px;
  }

  h5 {
      font-family: Verdana, Arial, sans-serif;
      font-size: 100%;
      color: #334d55;
      margin: 0px;
      padding: 0px;
  }

  ul {
      list-style-type: square;
  }

  ul ul {
      list-style-type: disc;
  }

  ul ul ul {
      list-style-type: none;
  }

  label {
      font-family: Arial, sans-serif;
      font-size: 100%;
      font-weight: bold;
      color: #334d55;
  }

  p {
      margin: 0;
      padding: 3px 0 6px 0;
  }

  /***********************************************/
  /* Layout Divs                                 */
  /***********************************************/
  #page_border {
      min-height: 800px;
      margin: 0px auto;
      padding: 0px;
  }

  #page_border_inner {
      /* border: 1px solid #002b70; */
      border-top: 0px;
      background-color: #FFFFFc;
  }

  #masthead {
      margin-bottom: 25px;
      padding: 10px 0px 0px 0px;
      width: 100%;
      overflow: visible;
  }

  #header {
      padding: 10px;
  }

  #logo {
      max-width: 100%;
      max-height: 100%;
  }

  #siteName {
      /* margin-left: 540px; */
      text-align: center;
      color: #FFFFFF
  }

  #siteName h1 {
      margin-bottom: 6px;
      margin-top: 16px;
      color: #FFFFFF;
      font-weight: bold;
  }

  #siteName P {
      font-size: 90%;
      font-weight: bold;
      margin-top: 12px;
      margin-bottom: 9px;
  }

  #navBar {
      padding: 0px;
      background-color: #eeeeee;
      border-right: 1px solid #cccccc;
      border-bottom: 1px solid #cccccc;
      font-size: 14px;
      margin-left: -15px;
  }

  /************ Home page styles **********************/
  #home IMG {
      float: left;
      padding: 0 12px 6px 0;
  }

  #home IMG.right {
      float: right;
      padding: 0 0px 6px 10px;
  }

  #homeHeader {
      padding: 10px 20px;
      margin: 0 0 0 202px;
  }

  #homeContent {
      /* margin-right: 30px; */
  }

  #homeContent h2 {
      color: #FFFFFF;
      background-color: #587E98;
      padding: 6px 20px;
      margin: 8px 0 15px 0;
  }

  /************** On sale (right column) styles ***************/
  #headlines {
      float: right;
      width: 250px;
      margin: 0px;
      padding: 0 0 20px 20px;
  }

  #headlines h2 {
      color: #FFFFFF;
      background-color: #587E98;
      padding: 6px 10px 6px 20px;
      width: 220px;
      margin: 8px 0 15px 0;
  }

  #headlines p {
      margin-left: 6px;
  }

  /*************** General Content styles *******************/
  #content {
      /* margin-right: 15px; */
  }

  /*************** General Code Page styles *****************/
  #content.codePage {
      /* width: 745px; */
      /* min-height: 600px; */
  }

  /*************** General Sub Page styles *****************/
  #content.twoColumns {
      width: 700px;
      margin: 0 0 0 0px;
      padding: 5px 20px 20px 20px;
      min-height: 600px;
  }

  #content.twoColumns h2 {
      color: #FFFFFF;
      background-color: #587E98;
      padding: 6px 20px;
      width: 94%;
      margin: 8px 0 15px 0;
  }

  #content.twoColumns p {
      margin-left: 6px;
  }

  #content.twoColumns IMG {
      padding: 12px;
  }

  #content.twoColumns IMG.left {
      float: left;
      padding: 0 12px 6px 0;
  }

  #content.twoColumns IMG.right {
      float: right;
      padding: 0 0px 6px 10px;
  }

  /************* #globalNav styles **************/
  nav.navbar {
      /* border: 1px solid #002b70; */
      border-bottom: 1px solid #cccccc;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: #eeeeee !important;
  }

  /*************** #pageName styles **************/
  #pageName {
      margin: 0px;
      padding: 0px 0px 0px 10px;
  }

  /************* #breadCrumb styles *************/
  #breadCrumb {
      font-size: 80%;
      padding: 2px 0px 0 10px;
  }

  /************* #siteInfo styles ***************/
  #siteInfo {
      clear: both;
      border: 1px solid #cccccc;
      font-size: 75%;
      color: #999999;
      padding: 10px 10px 10px 10px;
  }

  #siteInfo P {
      font-size: 9px;
  }

  #siteInfo img {
      padding: 4px 4px 4px 10px;
      vertical-align: middle;
  }

  #footer {
      clear: both;
      color: #666666;
      height: 30px;
  }

  #footerLeft, #footerRight {
      float: left;
      width: 20%;
  }

  #footerCenter {
      float: left;
      width: 59%;
      text-align: center;
  }

  /************* #search styles ***************/
  #search {
      padding: 5px 5px 5px 5px;
      border-bottom: 1px solid #cccccc;
      font-size: 90%;
  }

  #search form {
      margin: 0px;
      padding: 0px;
  }

  #search label {
      display: block;
      margin: 0px;
      padding: 0px;
  }

  /************** #topLinks styles **************/
  #topLinks {
      padding: 5px 10px 5px 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid #cccccc;
  }

  #topLinks IMG {
      display: block;
      text-align: right;
  }

  /************** #categories styles **************/
  #categories {
      /* padding: 5px 10px 5px 10px; */
      margin-bottom: 10px;
      color: #006699;
  }

  #categories li {
      margin: 2px 0px;
  }

  #categories .subcategory li {
      border-bottom: 1px solid #cccccc !important;
  }

  #categories a:hover {
      background-color: #dddddd;
  }

  #categories .subcategory {
      font-weight: bold;
  }

  #categories .subcategory LI {
      margin-left: 15px;
      font-weight: normal;
  }

  /*********** #navBar link styles ***********/
  #navBar ul a:link, #navBar ul a:visited {
      display: block;
  }

  #navBar ul {
      list-style: none;
      margin: 0;
      padding: 0;
  }

  /* hack to fix IE/Win's broken rendering of block-level anchors in lists */
  #navBar li {
      border-bottom: 1px solid #cccccc;
  }

  /* fix for browsers that don't need the hack */
  html>body #navBar li {
      border-bottom: none;
  }

  /*********** #sectionLinks styles ***********/
  #sectionLinks {
      position: relative;
      margin: 0px;
      padding: 0px;
      border-bottom: 1px solid #cccccc;
      font-size: 90%;
  }

  #sectionLinks h3 {
      padding: 10px 0px 2px 10px;
  }

  #sectionLinks a {
      display: block;
      border-top: 1px solid #cccccc;
      padding: 2px 0px 2px 10px;
  }

  #sectionLinks a:hover {
      background-color: #dddddd;
  }

  /*********** .relatedLinks styles ***********/
  .relatedLinks {
      position: relative;
      margin: 0px;
      padding: 0px 0px 10px 10px;
      font-size: 90%;
  }

  .relatedLinks h3 {
      padding: 10px 0px 2px 0px;
  }

  .relatedLinks a:link,
  .relatedLinks a:visited {
      display: block;
  }

  /************** #advert styles **************/
  #advert {
      padding: 30px 0px 10px;
  }

  #advert img {
      display: block;
  }

  /************** #headlines styles **************/
  #nav {
      background-color: #E8E8FF;
      width: 550px;
      margin: 0;
      padding: 0;
      float: left;
      padding-left: 40px;
      padding-top: 44px;
      color: #002b70;
      font-size: 16px;
  }

  /************ Specific CF Page style ***************/
  #category_results {
      width: 600px;
      margin: 20px auto;
  }

  #category_results .instructions {
      font-weight: bold;
      text-align: center;
      padding-bottom: 10px;
  }

  #category_results TABLE.subcategory,
  #onsale TABLE.subcategory,
  #search TABLE.subcategory {
      background-color: #C9D7E0;
      border: 1px solid #999999;
      width: 175px;
  }

  #category_results DIV.subcategory,
  #onsale DIV.subcategory,
  #search DIV.subcategory {
      width: 100%;
      text-align: center;
      min-height: 40px;
      color: #333333;
  }

  #category_results DIV.subcategory A,
  #category_results DIV.subcategory A.visited,
  #search DIV.subcategory A,
  #search DIV.subcategory A.visited {
      color: #333333;
  }

  #results,
  #whatsnew,
  #onsale,
  #addToCart,
  #wishList,
  #wishListRegister {
      /* padding: 20px 5px 15px 15px; */
      /* width: 720px; */
  }

  #results TABLE.description IMG,
  #onsale TABLE.description IMG,
  #whatsnew TABLE.description IMG {
      padding: 0 10px 0 10px;
      float: left;
      border: none;
  }

  TR.odd,
  .odd {
      /*
    background-color: #C9D7E0;
  */
      background-color: #ffffff;
  }

  TR.even,
  .even {
      background-color: #F4F4F4;
  }

  #detail {
      padding: 20px 15px;
  }

  #detail DIV.description IMG {
      padding: 10px;
  }

  #addToCart .msg {
      padding: 40px 20px;
  }

  #addToCart TR.header,
  #addToCart TR.header TD,
  #wishList TR.header,
  #wishList TR.header TD,
  #wishListRegister TR.header,
  #wishListRegister TR.header TD {
      background-color: #587E98;
  }

  #wishList TABLE.login {
      margin: 20px auto 0 auto;
  }

  .onSale {
      color: #CC3300;
      font-weight: bold;
  }

  .strikethough {
      text-decoration: line-through;
  }

  .product-teaser {
      height: 202px;
      margin-bottom: 10px;
  }

  .product-teaser .product-thumbnail {
      height: 150px;
      line-height: 150px;
      text-align: center;
      position: relative;
  }

  .product-teaser .product-thumbnail img {
      max-width: 100%;
      max-height: 100%;
      vertical-align: middle;
  }

  .product-teaser-title {
      color: #222;
      font-size: 14px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
  }

  .product-detail .product-large-image {
      height: 450px;
      line-height: 450px;
      text-align: center;
  }

  .product-detail .product-large-image img {
      max-width: 100%;
      max-height: 100%;
      vertical-align: middle;
  }

  .product-detail .product-title {
      font-size: 20px;
      font-weight: 400;
  }

  .nav-icon {
      display: block;
      text-align: center;
      color: #666666;
      float: none;
      font-size: 20px;
      min-width: 20px;
      top: auto;
      position: static;
      margin: 0 auto 0;
      width: auto;
      overflow: visible;
      text-indent: 0;
      background: none;
      height: 32px;
      line-height: 32px;
  }

  .text-link {
      display: block;
      clear: left;
      white-space: nowrap;
      color: #595959;
      font-size: 12px;
      margin-top: -2px;
  }

  /* Bootstrap theme */
  .btn.btn-primary {
      color: '#006699;'
  }

  .carousel-indicators li {
      background-color: #888;
  }

  .carousel-indicators .active {
      background-color: #333;
  }

  /* Fix bug with react-bootstrap inline forms */
  @media (max-width: 576px) {
      .form-inline .form-control {
          display: inline-block;
          width: auto;
          vertical-align: middle;
      }
  }

  .btn-primary:not(:disabled):not(.disabled) {
      color: #fff;
      background-color: #006699;
      border-color: #006699;
  }

  .btn-primary:not(:disabled):not(.disabled):hover {
      color: #fff;
      background-color: #0056b3;
      border-color: #0056b3;
  }

  @media (min-width: 1200px) {
    #page_border {
      max-width: 1140px;
    }
  }

`}
</style>
)
