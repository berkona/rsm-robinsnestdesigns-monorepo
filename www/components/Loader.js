import React from 'react'
import Loader from 'react-loaders'
import LoaderCSS from '../styles/loaders'

export default (props) => (
  <div style={{
    display: 'flex',
    marginTop: '100px',
    marginBottom: '100px',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', }
  }>
    <Loader color="#8BA8BC" type="square-spin" />
    <LoaderCSS />
  </div>
)
