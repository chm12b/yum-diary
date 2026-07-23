export const colors = {
  creamBg: "#FDF0E2",
  milkTea: "#F6EFE7",
  riceWhite: "#FDF8F3",
  khaki: "#EADCC6",
  warmGray: "#F2E3CF",
  caramel: "#B98F6B",
  softOrange: "#E89B62",
  deepBrown: "#8C6B4F",
  cocoa: "#A67C52",
  softGray: "#CFC7BE",
  sakuraPink: "#F7C9CF",
  textPrimary: "#6D5240",
  textSecondary: "#A68D7B",
  border: "#E6D8C7",
  statusOpenBg: "#E6F0E1",
  statusOpenFg: "#5F8A56",
  statusClosedBg: "#F7E0DC",
  statusClosedFg: "#B25F59",
  statusHolidayBg: "#F8E6CD",
  statusHolidayFg: "#B9792F",
  statusUnknownBg: "#ECE6DE",
  statusUnknownFg: "#9D8D7C",
} as const;

export const shadows = {
  soft: "0 2px 10px rgb(109 82 64 / 0.06)",
  card: "0 6px 24px rgb(140 107 79 / 0.07)",
  button: "0 6px 0 0 #dcc7b2, 0 10px 24px rgb(140 107 79 / 0.12)",
  pinkButton: "0 5px 0 0 #e8b0b7",
} as const;

export const layout = {
  appMaxWidth: "28rem",
  bottomNavHeight: "5.625rem",
} as const;

export const theme = {
  colors,
  layout,
  shadows,
} as const;
