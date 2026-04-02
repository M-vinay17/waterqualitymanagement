import { render, screen } from "@testing-library/react";
import WaterQualityOverview from "../pages/authority/WaterQualityOverview";

test("renders loading state initially", () => {
  render(<WaterQualityOverview />);
  
  const loadingText = screen.getByText(/loading charts/i);
  expect(loadingText).toBeInTheDocument();
});