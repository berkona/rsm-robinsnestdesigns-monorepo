import Carousel from 'react-bootstrap/Carousel'
import carouselItems from '../content/home'

export default () => <>
  <Carousel controls={false}
            className="d-xs-none"
            style={{ marginTop: '16px' }}>
    {
      (carouselItems || []).map((__html, i) => (
        <Carousel.Item key={i}>
          <div dangerouslySetInnerHTML={{ __html, }}></div>
        </Carousel.Item>
      ))
    }
  </Carousel>
</>
