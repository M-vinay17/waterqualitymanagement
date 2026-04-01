import { render, screen } from "@testing-library/react";
import AlertManagement from "../pages/authority/AlertManagement";

test("renders Alert Management title", () => {
  render(<AlertManagement />);
  
  const title = screen.getByText(/alert management/i);
  expect(title).toBeInTheDocument();
});