import React from 'react'
import Loader from 'react-loaders'

export default (props) => (
  <div style={{
    display: 'flex',
    marginTop: '200px',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', }
  }>
    <Loader color="#8BA8BC" type="square-spin" />
  </div>
)
