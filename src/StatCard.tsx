import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <p className="text-lg font-medium">오류가 발생했습니다</p>
          <p className="text-sm">{this.state.message}</p>
          <button
            className="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
