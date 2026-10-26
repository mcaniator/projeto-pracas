"use client";

import { Box } from "@mui/material";
import {
  type CustomContentProps,
  SnackbarContent,
} from "notistack";
import { type ReactNode, forwardRef } from "react";

declare module "notistack" {
  interface VariantOverrides {
    node: {
      backgroundColor: string;
      node: ReactNode;
    };
  }
}

type NodeSnackbarProps = CustomContentProps & {
  backgroundColor: string;
  node: ReactNode;
};

const NodeSnackbar = forwardRef<HTMLDivElement, NodeSnackbarProps>(
  ({ action, backgroundColor, className, id, node, style }, ref) => {
    const resolvedAction = typeof action === "function" ? action(id) : action;

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        className={className}
        style={{
          ...style,
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            backgroundColor,
            borderRadius: 1,
            boxShadow: 6,
            color: "common.white",
            display: "flex",
            gap: 1,
            minWidth: 288,
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>{node}</Box>
          {resolvedAction}
        </Box>
      </SnackbarContent>
    );
  },
);

NodeSnackbar.displayName = "NodeSnackbar";

export default NodeSnackbar;
