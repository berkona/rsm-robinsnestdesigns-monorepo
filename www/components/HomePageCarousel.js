import Carousel from 'react-bootstrap/Carousel'
import carouselItems from '../content/home'

export default () => <>
  <Carousel controls={false}
            className="d-none d-sm-block"
            style={{ marginTop: '16px' }}>
    {
      (carouselItems || []).map((__html, i) => (
        <Carousel.Item key={i}>
          <div dangerouslySetInnerHTML={{ __html, }}></div>
        </Carousel.Item>
      ))
    }
  </Carousel>
  {
    (carouselItems || []).map((__html, i) => (
      <div key={i} className="d-block d-sm-none">
        <div dangerouslySetInnerHTML={{ __html, }}></div>
        <hr />
      </div>
    ))
  }
</>
