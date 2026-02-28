import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "@/hooks/useWebSocket";

const sendMock = vi.fn();

vi.mock("@/lib/websocket", () => {
  return {
    WebSocketClient: class {
      connect = vi.fn().mockResolvedValue(undefined);
      disconnect = vi.fn();
      send = sendMock;
      on = vi.fn();
    },
  };
});

describe("useWebSocket", () => {
  it("initializes with disconnected state", () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.roomState).toBe(null);
  });

  it("sends create room message", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.createRoom("Player1");
    });

    expect(sendMock).toHaveBeenCalledWith("create_room", { nickname: "Player1" });
  });

  it("sends join room message", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.joinRoom("ABC123", "Player1");
    });

    expect(sendMock).toHaveBeenCalledWith("join_room", {
      roomCode: "ABC123",
      nickname: "Player1",
    });
  });
});
