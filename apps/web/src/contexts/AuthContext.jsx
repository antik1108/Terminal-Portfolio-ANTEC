import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authClient } from '@antec/api-client'
import { AUTH_STATES, TERMINAL_CONSTANTS } from '@antec/shared'

// Auth action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  RESET: 'RESET'
}

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authState: AUTH_STATES.UNAUTHENTICATED
}

// Auth reducer for state management
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
        authState: action.payload ? AUTH_STATES.AUTHENTICATING : state.authState
      }
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
        authState: action.payload ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED
      }
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        authState: AUTH_STATES.ERROR
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        authState: state.user ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        authState: AUTH_STATES.UNAUTHENTICATED
      }
    
    case AUTH_ACTIONS.RESET:
      return initialState
    
    default:
      return state
  }
}

// Create Auth Context
const AuthContext = createContext(null)

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user has a stored token
      if (authClient.isAuthenticated()) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        
        try {
          // Verify token by fetching current user
          const response = await authClient.getCurrentUser()
          if (response.success && response.user) {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
          } else {
            // Token is invalid, clear auth data
            authClient.clearAuthData()
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
          }
        } catch (error) {
          // Token is invalid or expired, clear auth data
          authClient.clearAuthData()
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      }
    }

    initializeAuth()
  }, [])

  // Emit auth change event helper
  const emitAuthChange = (user) => {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('antec:authChange', { detail: { user } }))
      }
    } catch (e) {
      // ignore
    }
  }

  // Signup function
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authClient.signup(userData)
      
      if (response.success) {
        // Store user data if provided
        if (response.user) {
          authClient.storeUser(response.user)
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
          emitAuthChange(response.user)
        }
        return response
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.message })
        return response
      }
    } catch (error) {
      const errorMessage = error.message || TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      throw error
    }
  }

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authClient.login(credentials)
      
      if (response.success) {
        // Store user data if provided
        if (response.user) {
          authClient.storeUser(response.user)
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
          emitAuthChange(response.user)
        }
        return response
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.message })
        return response
      }
    } catch (error) {
      const errorMessage = error.message || TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

    try {
      // Attempt server logout (best-effort)
      await authClient.logout()
    } catch (error) {
      // ignore server errors - we'll still clear local state
    } finally {
      // Always clear local auth data and reset state to avoid stale localStorage
      try {
        authClient.clearAuthData()
      } catch (e) {
        // ignore storage errors
      }
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      // notify listeners that we've logged out
      emitAuthChange(null)
    }

    return {
      success: true,
      message: TERMINAL_CONSTANTS.SUCCESS_MESSAGES.LOGOUT
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Get current user from stored data
  const getCurrentUser = () => {
    return state.user || authClient.getStoredUser()
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return state.isAuthenticated && !!state.user
  }

  // Get authentication token
  const getToken = () => {
    return authClient.getStoredToken()
  }

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    authState: state.authState,
    
    // Actions
    signup,
    login,
    logout,
    clearError,
    
    // Utility functions
    getCurrentUser,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext