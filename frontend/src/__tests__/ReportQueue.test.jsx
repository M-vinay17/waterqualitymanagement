import { render, screen } from "@testing-library/react";
import ReportQueue from "../pages/authority/ReportQueue.jsx";

test("renders Report Queue title", () => {
  render(<ReportQueue />);
  
  const title = screen.getByText(/report queue/i);
  expect(title).toBeInTheDocument();
});