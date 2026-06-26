export const colors = {
  milkTea: "#F6EFE7",
  riceWhite: "#FDF8F3",
  khaki: "#EADCC6",
  warmGray: "#F2E3CF",
  caramel: "#B98F6B",
  deepBrown: "#8C6B4F",
  cocoa: "#A67C52",
  softGray: "#CFC7BE",
} as const;

export const shadows = {
  soft: "0 4px 18px rgb(140 107 79 / 0.08)",
  card: "0 6px 24px rgb(140 107 79 / 0.07)",
  button: "0 6px 0 0 #dcc7b2, 0 10px 24px rgb(140 107 79 / 0.12)",
} as const;

export const layout = {
  appMaxWidth: "28rem",
  bottomNavHeight: "4.5rem",
} as const;

export const theme = {
  colors,
  layout,
  shadows,
} as const;
