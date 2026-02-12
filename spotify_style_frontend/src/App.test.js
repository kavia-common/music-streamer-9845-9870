import { render, screen, within } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);

  // Avoid duplicate matches (e.g., Home in sidebar + page header) by scoping
  // assertions to the primary navigation landmark.
  const nav = screen.getByRole("navigation", { name: /primary navigation/i });

  expect(within(nav).getByRole("link", { name: /home/i })).toBeInTheDocument();
  expect(within(nav).getByRole("link", { name: /search/i })).toBeInTheDocument();
  expect(within(nav).getByRole("link", { name: /your library/i })).toBeInTheDocument();
});
