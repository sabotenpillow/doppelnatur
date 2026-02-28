import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelector from "@/components/LanguageSelector";
import { LanguageProvider } from "@/context/LanguageContext";

describe("LanguageSelector", () => {
  it("renders language selector and changes language", () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    expect(screen.getByText("日本語")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("言語を選択"));
    fireEvent.click(screen.getByText("English (US)"));

    expect(screen.getByText("English (US)")).toBeInTheDocument();
  });
});
