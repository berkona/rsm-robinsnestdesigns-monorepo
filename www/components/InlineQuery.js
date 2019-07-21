import { Query } from 'react-apollo'
import ApolloError from '../components/ApolloError'

export default ({ query, variables, children }) => <Query query={query} variables={variables}>
  {({ loading, error, data }) => {
    if (loading) return <p>Loading...</p>
    if (error) return <ApolloError error={error} />
    if (!data) return <p>No data returned from server</p>
    return children(data)
  }}
</Query>
