import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function TestComponent() {
  const { t, setLocale } = useLanguage();

  return (
    <div>
      <span>{t("home.title")}</span>
      <button onClick={() => setLocale("en-US")}>Switch</button>
    </div>
  );
}

describe("LanguageContext", () => {
  it("provides default language and allows switching", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByText("人狼ゲーム")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Switch"));

    expect(screen.getByText("Werewolf Game")).toBeInTheDocument();
  });
});
