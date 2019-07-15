import React from 'react'
import Card from 'react-bootstrap/Card'

export default ({ category, children }) => {
  let [ title, subtitle ] = category && category.title && category.title.split('-')
  title = title && title.trim()
  subtitle = subtitle && subtitle.trim()
  return  <Card>
    <Card.Body>
      <Card.Title>{title}</Card.Title>
      <Card.Subtitle>{subtitle}</Card.Subtitle>
      <Card.Text>{category.comments}</Card.Text>
      {children}
    </Card.Body>
  </Card>
}
