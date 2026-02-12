import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Search/i)).toBeInTheDocument();
  expect(screen.getByText(/Your Library/i)).toBeInTheDocument();
});
