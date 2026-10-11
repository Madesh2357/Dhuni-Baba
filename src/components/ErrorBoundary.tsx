import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

/**
 * Catches errors thrown while rendering its children (for example a failed
 * download of the chart code on a flaky connection) and shows `fallback`
 * instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Dhuni Baba could not render this section:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
