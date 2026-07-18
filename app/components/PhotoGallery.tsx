"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Dialog,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getPresignedPhotoUrl } from "@/app/actions/photo";

interface PhotoGalleryProps {
  photoKeys: string[];
}

export default function PhotoGallery({ photoKeys }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresignedUrls = async () => {
      setLoading(true);
      const urls: string[] = [];

      for (const key of photoKeys) {
        const result = await getPresignedPhotoUrl(key);
        if ("url" in result) {
          urls.push(result.url);
        }
      }

      setPhotoUrls(urls);
      setLoading(false);
    };

    if (photoKeys.length > 0) {
      fetchPresignedUrls();
    } else {
      setPhotoUrls([]);
      setLoading(false);
    }
  }, [photoKeys]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setLightboxIndex((prev) =>
      prev === 0 ? photoUrls.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setLightboxIndex((prev) =>
      prev === photoUrls.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photoUrls.length]);

  if (loading) {
    return <CircularProgress size={32} />;
  }

  if (photoUrls.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No photos yet.
      </Typography>
    );
  }

  return (
    <>
      <ImageList
        variant="masonry"
        cols={3}
        gap={8}
        sx={{ width: "100%", mt: 0 }}
      >
        {photoUrls.map((url, i) => (
          <ImageListItem key={photoKeys[i]}>
            <Box
              component="img"
              src={url}
              alt={`Playground photo ${i + 1}`}
              loading="lazy"
              onClick={() => openLightbox(i)}
              sx={{
                width: "100%",
                borderRadius: 1,
                display: "block",
                cursor: "pointer",
                transition: "opacity 0.2s",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.95)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            p: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              zIndex: 10,
            }}
            aria-label="Close"
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          {/* Main Image */}
          <Box
            component="img"
            src={photoUrls[lightboxIndex]}
            alt={`Playground photo ${lightboxIndex + 1}`}
            sx={{
              maxHeight: "80vh",
              maxWidth: "100%",
              borderRadius: 1,
              objectFit: "contain",
            }}
          />

          {/* Navigation and Counter */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mt: 2 }}
          >
            {/* Previous Button */}
            <IconButton
              onClick={goToPrevious}
              sx={{ color: "white" }}
              aria-label="Previous photo"
            >
              <ArrowBackIosIcon />
            </IconButton>

            {/* Counter */}
            <Typography
              variant="body1"
              sx={{
                color: "white",
                minWidth: 60,
                textAlign: "center",
              }}
            >
              {lightboxIndex + 1} / {photoUrls.length}
            </Typography>

            {/* Next Button */}
            <IconButton
              onClick={goToNext}
              sx={{ color: "white" }}
              aria-label="Next photo"
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
}
