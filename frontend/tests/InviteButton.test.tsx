import { render, screen, fireEvent, act } from "@testing-library/react";
import InviteButton from "@/components/InviteButton";
import { LanguageProvider } from "@/context/LanguageContext";

describe("InviteButton", () => {
  it("opens dropdown and shows invite options", () => {
    render(
      <LanguageProvider>
        <InviteButton roomCode="ABC123" />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText("招待する"));

    expect(screen.getByText("友達を招待")).toBeInTheDocument();
    expect(screen.getByText("リンクをコピー")).toBeInTheDocument();
    expect(screen.getByText("LINEで共有")).toBeInTheDocument();
    expect(screen.getByText("メールで共有")).toBeInTheDocument();
  });

  it("copies link to clipboard", async () => {
    render(
      <LanguageProvider>
        <InviteButton roomCode="ABC123" />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText("招待する"));

    await act(async () => {
      fireEvent.click(screen.getByText("リンクをコピー"));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
