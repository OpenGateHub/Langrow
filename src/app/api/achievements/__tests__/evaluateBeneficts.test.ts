import { evaluateBenefits, calculateAchievement } from "../achievements";
import { supabaseClient } from "@/app/api/supabaseClient";

// Mock de supabase y la función externa
jest.mock("@/app/api/supabaseClient", () => ({
  supabaseClient: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn(),
  },
}));

jest.mock("../achievements", () => ({
  ...jest.requireActual("../achievements"),
  calculateAchievement: jest.fn(),
}));

describe("evaluateBenefits", () => {
  const profileId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería llamar a calculateAchievement para cada logro activo", async () => {
    const mockAchievements = [
      { code: "ACHIEVE_1" },
      { code: "ACHIEVE_2" },
    ];

    (supabaseClient.eq as jest.Mock).mockResolvedValue({
      data: mockAchievements,
      error: null,
    });

    await evaluateBenefits(profileId);

    expect(supabaseClient.from).toHaveBeenCalledWith("ACHIEVEMENT");
    expect(supabaseClient.select).toHaveBeenCalledWith("code");
    expect(supabaseClient.eq).toHaveBeenCalledWith("isActive", true);

    expect(calculateAchievement).toHaveBeenCalledTimes(mockAchievements.length);
    mockAchievements.forEach((achievement, index) => {
      expect(calculateAchievement).toHaveBeenNthCalledWith(
        index + 1,
        achievement.code,
        profileId
      );
    });
  });

  it("no debería llamar a calculateAchievement si no hay logros", async () => {
    (supabaseClient.eq as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    await evaluateBenefits(profileId);

    expect(calculateAchievement).not.toHaveBeenCalled();
  });

  it("debería manejar errores al hacer query a Supabase", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    (supabaseClient.eq as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Error de base de datos" },
    });

    await evaluateBenefits(profileId);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al obtener los logros activos:",
      { message: "Error de base de datos" }
    );

    consoleErrorSpy.mockRestore();
  });
});
