import React from 'react'

export const CurrentUserContext = React.createContext({
  login: (token) => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  isLoggedIn: () => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  getToken: () => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  logout: () => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  getCartId: () => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  setCartId: (cartId) => {
    throw new Error('Not Implemented! Check if provider is in tree')
  },
  deleteCartId: () => {
    throw new Error('Not Implemented! Check if provider is in tree')
  }
})

export const CurrentUser = CurrentUserContext.Consumer
export const CurrentUserProvider = CurrentUserContext.Provider
