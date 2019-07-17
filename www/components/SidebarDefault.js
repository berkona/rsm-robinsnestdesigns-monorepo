import React from 'react'
import Sidebar from '../components/Sidebar'
import CategoryLinks from '../components/CategoryLinks'
import TopLinks from '../components/TopLinks'

export default () => <Sidebar>
  <div style={{ padding: '5px 10px 5px 10px' }}>
    <TopLinks />
    <CategoryLinks useCategoryLinks={true} />
  </div>
</Sidebar>
