"use client";

import type { ComponentProps, ReactElement } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ThemeProvider = ({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>): ReactElement => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
);
