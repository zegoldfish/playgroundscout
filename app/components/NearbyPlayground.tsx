"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlaygroundExists } from "@/app/hooks/usePlaygroundExists";
import { savePlayground } from "@/app/actions/playground";
import { listAmenities } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { getTileUrl } from "@/app/utils/tiles";
import RatingDisplay from "./RatingDisplay";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Button,
  Typography,
  Box,
  Stack,
  ListItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface PlaygroundProps {
  playground: {
    id: number;
    name: string;
    lat: number;
    lon: number;
    distance?: number;
    tags?: Record<string, string>;
  };
}

// Helper to get emoji based on leisure type
function getLeisureEmoji(leisure: string | undefined): string {
  if (!leisure) return "🎯";
  if (leisure === "playground") return "🛝";
  if (leisure === "park") return "🌳";
  return "🎯";
}

// Helper to extract and format relevant tag chips
function getTagChips(tags: Record<string, string> | undefined): Array<{
  label: string;
  type: string;
}> {
  if (!tags) return [];

  const chips: Array<{ label: string; type: string }> = [];

  if (tags.leisure) {
    chips.push({
      label: tags.leisure === "playground" ? "Playground" : "Park",
      type: "leisure",
    });
  }

  if (tags.surface) {
    const surfaceLabel = {
      asphalt: "Asphalt",
      wood_chips: "Wood Chips",
      sand: "Sand",
      rubber: "Rubber",
      grass: "Grass",
      concrete: "Concrete",
    }[tags.surface];
    if (surfaceLabel) {
      chips.push({ label: surfaceLabel, type: "surface" });
    }
  }

  if (tags.lit) {
    chips.push({ label: "Lit", type: "lit" });
  }

  if (tags.wheelchair === "yes") {
    chips.push({ label: "Wheelchair Accessible", type: "wheelchair" });
  }

  return chips;
}

export default function NearbyPlayground({ playground }: PlaygroundProps) {
  const {
    exists,
    loading,
    refetch,
    playground: savedPlayground,
  } = usePlaygroundExists(playground.id);
  const [storedName, setStoredName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  const [amenityNames, setAmenityNames] = useState<string[]>([]);

  useEffect(() => {
    const name = localStorage.getItem(`playground-${playground.id}-name`);
    if (name) {
      setStoredName(name);
    }
  }, [playground.id]);

  useEffect(() => {
    const loadAmenityNames = async () => {
      if (!savedPlayground?.amenities || savedPlayground.amenities.length === 0) {
        setAmenitiesLoaded(true);
        return;
      }

      try {
        const allAmenities = await listAmenities();
        const amenityMap = new Map(
          allAmenities.map((a) => [a.amenity_id, amenityNameToDisplay(a.name)])
        );
        const names = savedPlayground.amenities
          .map((id) => amenityMap.get(id))
          .filter((name): name is string => name !== undefined);
        setAmenityNames(names);
        setAmenitiesLoaded(true);
      } catch (error) {
        console.error("Failed to load amenity names:", error);
        setAmenitiesLoaded(true);
      }
    };
    loadAmenityNames();
  }, [savedPlayground?.amenities]);

  const displayName = storedName ?? playground.name;
  const emoji = getLeisureEmoji(playground.tags?.leisure);
  const chips = getTagChips(playground.tags);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePlayground({
        osm_id: playground.id,
        name: playground.name,
        latitude: playground.lat,
        longitude: playground.lon,
        tags: playground.tags,
      });

      if (result.success) {
        refetch();
      } else {
        alert(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

  const cardContent = (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: exists
          ? "2px solid"
          : "1px solid",
        borderColor: exists ? "success.main" : "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Map Image */}
      <Box sx={{ position: "relative", overflow: "hidden", height: 150 }}>
        <CardMedia
          component="img"
          height={150}
          image={getTileUrl(playground.lat, playground.lon)}
          alt={`Map of ${displayName}`}
          sx={{ objectFit: "cover" }}
        />
        {/* Emoji overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 24,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: 1,
            p: 0.5,
          }}
        >
          {emoji}
        </Box>
        {/* Attribution */}
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            right: 4,
            fontSize: "0.7rem",
            color: "white",
            background: "rgba(0, 0, 0, 0.5)",
            px: 0.5,
            borderRadius: 0.5,
          }}
        >
          © OSM
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title with distance */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              flex: 1,
              wordBreak: "break-word",
            }}
          >
            {displayName}
          </Typography>
          {playground.distance && (
            <Chip
              label={`${playground.distance.toFixed(1)} km`}
              size="small"
              variant="outlined"
              sx={{ ml: 1, flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Rating - only for saved */}
        {exists && savedPlayground && (
          <Box sx={{ mb: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <RatingDisplay
              rating={savedPlayground.average_rating}
              count={savedPlayground.rating_count}
              size="small"
            />
          </Box>
        )}

        {/* Tag chips */}
        {chips.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
            {chips.map((chip) => (
              <Chip
                key={chip.label}
                label={chip.label}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Amenities - only for saved */}
        {exists && amenitiesLoaded && amenityNames.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Amenities
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
              {amenityNames.map((name) => (
                <Chip key={name} label={name} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ pt: 1 }}>
        {loading ? (
          <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
            Loading...
          </Typography>
        ) : exists === false ? (
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            fullWidth
          >
            {saving ? "Adding..." : "Add to Scout"}
          </Button>
        ) : (
          <>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                ✓ Saved to Scout
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "primary.main" }}>
              View →
            </Typography>
          </>
        )}
      </CardActions>
    </Card>
  );

  // If saved to DB, wrap in a link to the detail page
  if (exists === true) {
    return (
      <ListItem sx={{ p: 0, mb: 1.5 }}>
        <Link
          href={`/playground/playground-${playground.id}`}
          style={{
            textDecoration: "none",
            width: "100%",
          }}
        >
          {cardContent}
        </Link>
      </ListItem>
    );
  }

  // If not saved, render as plain card (no link)
  return <ListItem sx={{ p: 0, mb: 1.5 }}>{cardContent}</ListItem>;
}
