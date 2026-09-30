import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {};

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  private readonly onReset = () => {
    this.setState({ error: undefined });
  };

  public render(): ReactNode {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <Paper className="error-boundary" elevation={5} sx={{ p: 3 }}>
        <Typography component="h2" variant="h5" gutterBottom>
          Something went wrong
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
        <Box>
          <Button variant="contained" type="button" onClick={this.onReset}>
            Try again
          </Button>
        </Box>
      </Paper>
    );
  }
}
