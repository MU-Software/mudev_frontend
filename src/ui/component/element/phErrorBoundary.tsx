import React from 'react';

const changedArray = (prevArray: Array<unknown> = [], nextArray: Array<unknown> = []) =>
  prevArray.length !== nextArray.length || prevArray.some((item, index) => !Object.is(item, nextArray[index]));

export interface ErrorBoundaryBaseProps {
  onError?: (error: Error, info: React.ErrorInfo) => void;
  resetKeys?: Array<unknown>;
  fallback?: React.ReactElement<unknown, string | React.FunctionComponent | typeof React.Component> | null
}

type ErrorBoundaryState = { error: Error | null };

const initialState: ErrorBoundaryState = { error: null };

export class ErrorBoundary extends React.Component<React.PropsWithRef<React.PropsWithChildren<ErrorBoundaryBaseProps>>,
  ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state = initialState;

  resetErrorBoundary = () => this.reset()

  reset() {
    this.setState(initialState);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryBaseProps, prevState: ErrorBoundaryState,) {
    const { error } = this.state;
    const { resetKeys } = this.props;

    if (error !== null && prevState.error !== null && changedArray(prevProps.resetKeys, resetKeys)) this.reset();
  }

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error !== null) {
      const props = {error, resetErrorBoundary: this.resetErrorBoundary};
      if (React.isValidElement(fallback)) return fallback;
      props.resetErrorBoundary();
    }
    return children;
  }
}

type ErrorBoundaryProps = React.ComponentProps<typeof ErrorBoundary>;

interface Props extends Omit<ErrorBoundaryProps, 'renderFallback'> {
  fallback?: ErrorBoundaryProps['fallback'];
  isRefresh?: boolean;
  style?: React.CSSProperties;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children?: React.ReactNode;
}

const RefreshButton = ({ dispatch, style }: { dispatch: (flag: boolean) => void; style?: React.CSSProperties; }): JSX.Element => {
  return <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    <button style={{ padding: '5px' }} onClick={() => dispatch(false)}>새로고침</button>
  </div>;
};

export const RefreshableErrorBoundary = ({fallback, style, onError, children, ...errorBoundaryProps}: Props) => {
  const [refresh, setRefresh] = React.useState<boolean>(false);
  return (
    <ErrorBoundary
      fallback={fallback}
      resetKeys={[refresh]}
      onError={(error, info) => {
        setRefresh?.(true);
        onError?.(error, info);
      }}
      {...errorBoundaryProps}
    >
      {!refresh ? children : <RefreshButton dispatch={setRefresh} style={style} />}
    </ErrorBoundary>
  );
};
