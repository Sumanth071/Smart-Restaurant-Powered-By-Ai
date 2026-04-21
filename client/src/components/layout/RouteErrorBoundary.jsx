import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Component } from "react";
import { Link, useLocation } from "react-router-dom";

class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="glass-panel max-w-xl p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-rose-50 text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Route recovery</p>
          <h2 className="mt-3 font-display text-4xl text-stone-900">This screen ran into an error.</h2>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            The rest of the application is still safe. You can reload this route or move back to a stable workspace screen.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => this.setState({ error: null })} className="btn-primary">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry Route
            </button>
            <Link to="/" className="btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

const RouteErrorBoundary = ({ children }) => {
  const location = useLocation();

  return <Boundary resetKey={location.pathname}>{children}</Boundary>;
};

export default RouteErrorBoundary;
