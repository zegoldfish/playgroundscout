"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Playground as PlaygroundType } from "@/app/schemas/playground";
import { listAmenities } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { listParkings } from "@/app/actions/parking";
import RatingDisplay from "./RatingDisplay";
import RatingForm from "./RatingForm";
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const PlaygroundMap = dynamic(() => import("./PlaygroundMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 320,
        width: "100%",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1.5,
      }}
    >
      <CircularProgress />
    </Box>
  ),
});

interface PlaygroundProps {
  playground: PlaygroundType;
}

export default function Playground({ playground }: PlaygroundProps) {
  const { data: session } = useSession();
  const [amenityNames, setAmenityNames] = useState<string[]>([]);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  const [parkingNames, setParkingNames] = useState<string[]>([]);
  const [parkingsLoaded, setParkingsLoaded] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);

  useEffect(() => {
    const loadAmenityNames = async () => {
      if (!playground.amenities || playground.amenities.length === 0) {
        setAmenitiesLoaded(true);
        return;
      }

      try {
        const allAmenities = await listAmenities();
        const amenityMap = new Map(
          allAmenities.map((a) => [a.amenity_id, amenityNameToDisplay(a.name)])
        );
        const names = playground.amenities
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
  }, [playground.amenities]);

  useEffect(() => {
    const loadParkingNames = async () => {
      if (!playground.parkings || playground.parkings.length === 0) {
        setParkingsLoaded(true);
        return;
      }

      try {
        const allParkings = await listParkings();
        const parkingMap = new Map(allParkings.map((p) => [p.parking_id, p.name]));
        const names = playground.parkings
          .map((id) => parkingMap.get(id))
          .filter((name): name is string => name !== undefined);
        setParkingNames(names);
        setParkingsLoaded(true);
      } catch (error) {
        console.error("Failed to load parking names:", error);
        setParkingsLoaded(true);
      }
    };
    loadParkingNames();
  }, [playground.parkings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        p: 4,
        background: "white",
      }}
    >
      <Stack spacing={4}>
        {/* Map Section */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Location
          </Typography>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <PlaygroundMap
              latitude={playground.latitude}
              longitude={playground.longitude}
              name={playground.name}
            />
          </Box>
        </Box>

        <Divider />

        {/* Rating Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Rating
            </Typography>
            {session?.user && (
              <Button
                onClick={() => setIsEditingRating(!isEditingRating)}
                variant={isEditingRating ? "outlined" : "contained"}
                size="small"
              >
                {isEditingRating ? "Cancel" : "Add Rating"}
              </Button>
            )}
          </Box>

          {isEditingRating && session?.user ? (
            <RatingForm
              playgroundId={playground.park_id}
              userId={(session.user as any).id}
              onSuccess={() => setIsEditingRating(false)}
              onCancel={() => setIsEditingRating(false)}
            />
          ) : (
            <Box sx={{ pl: 2, borderLeft: "3px solid", borderColor: "primary.main" }}>
              <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                Average Rating:
              </Typography>
              <RatingDisplay
                rating={playground.average_rating}
                count={playground.rating_count}
                size="large"
              />
            </Box>
          )}

          {!session?.user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Sign in to add your rating
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Amenities Section */}
        {playground.amenities && playground.amenities.length > 0 && (
          <>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Amenities
              </Typography>
              {!amenitiesLoaded ? (
                <CircularProgress size={24} />
              ) : amenityNames.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {amenityNames.map((name, index) => (
                    <Chip key={index} label={name} variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No amenities available</Alert>
              )}
            </Box>
            <Divider />
          </>
        )}

        {/* Parking Section */}
        {playground.parkings && playground.parkings.length > 0 && (
          <>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Parking
              </Typography>
              {!parkingsLoaded ? (
                <CircularProgress size={24} />
              ) : parkingNames.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {parkingNames.map((name, index) => (
                    <Chip key={index} label={name} variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No parking available</Alert>
              )}
            </Box>
            <Divider />
          </>
        )}

        {/* OSM Tags Section - Accordion */}
        {playground.osm_tags && Object.keys(playground.osm_tags).length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Additional Tags
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                {Object.entries(playground.osm_tags).map(([key, value]) => (
                  <Box key={key}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}
                      >
                        {key}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Metadata Footer */}
        <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Metadata
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Park ID
              </Typography>
              <Typography variant="body2">{playground.park_id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                OSM ID
              </Typography>
              <Typography variant="body2">{playground.osm_id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Latitude
              </Typography>
              <Typography variant="body2">{playground.latitude}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Longitude
              </Typography>
              <Typography variant="body2">{playground.longitude}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Created
              </Typography>
              <Typography variant="body2">{formatDate(playground.created_at)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Updated
              </Typography>
              <Typography variant="body2">{formatDate(playground.updated_at)}</Typography>
            </Box>
            {playground.location_hash && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Location Hash
                </Typography>
                <Typography variant="body2">{playground.location_hash}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
