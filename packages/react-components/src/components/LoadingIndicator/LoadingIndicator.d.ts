import React from 'react';

export interface LoadingIndicatorProps {
  /**
   * The message visible on screen when loading
   */
  message: string;
  /**
   * Set to true if the loading indicator should capture focus
   */
  setFocus?: boolean;
  /**
   * An aXe label
   */
  label?: string;
  /**
   * Analytics tracking function(s) will be called. Form components
   * are disabled by default due to PII/PHI concerns.
   */
  enableAnalytics?: boolean;
}

export default class LoadingIndicator extends React.Component<LoadingIndicatorProps> {
  constructor(props: LoadingIndicatorProps);
  componentDidMount(): void;
  componentWillUnmount(): void;
  render(): React.ReactNode;
}
