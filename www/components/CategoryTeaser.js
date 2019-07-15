import React from 'react'
import Card from 'react-bootstrap/Card'
import { NO_IMAGE_URL } from '../constants/config'

export default ({ category, children }) => {
  let [ title, subtitle ] = category && category.title && category.title.split(' - ')
  title = title && title.trim()
  subtitle = subtitle && subtitle.trim()
  return  <Card className="category-teaser">
    <style jsx global>{`
      .category-teaser .card-img-top {
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 16px;
        height: 200px;
        width: 100%;
      }

      .category-teaser .card-subtitle {
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .category-teaser .card-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `}</style>
    <Card.Img
      variant="top"
      src={category.image || NO_IMAGE_URL }
      />
    <Card.Body>
      <Card.Title>{title}</Card.Title>
      { subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
      {children}
    </Card.Body>
  </Card>
}
