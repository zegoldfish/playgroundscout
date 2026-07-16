"use client";

import { useState } from "react";
import Link from "next/link";
import PlaygroundEditForm from "@/app/components/PlaygroundEditForm";
import Playground from "@/app/components/Playground";
import { Playground as PlaygroundType } from "@/app/schemas/playground";
import { Container, Box, Button, Typography, Stack } from "@mui/material";

interface PlaygroundToggleProps {
  playground: PlaygroundType;
}

export default function PlaygroundToggle({ playground }: PlaygroundToggleProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f7ff 0%, #e5f4ff 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          component={Link}
          href="/"
          variant="text"
          sx={{
            mb: 2,
            color: "primary.main",
            fontWeight: 500,
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          ← Back
        </Button>

        {/* Page Header */}
        {!isEditing && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <Typography variant="h2" sx={{ flex: 1, fontWeight: 700 }}>
              {playground.name}
            </Typography>
            <Button
              onClick={() => setIsEditing(true)}
              variant="contained"
              color="success"
              size="large"
              sx={{ flexShrink: 0 }}
            >
              Edit
            </Button>
          </Box>
        )}

        {/* Content */}
        {isEditing ? (
          <PlaygroundEditForm
            playground={playground}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Playground playground={playground} />
        )}
      </Container>
    </Box>
  );
}
