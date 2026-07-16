"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { listAmenities, deleteAmenity } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import AmenityCreateForm from "@/app/components/AmenityCreateForm";
import { Amenity } from "@/app/schemas/amenity";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  CircularProgress,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface AmenityPageClientProps {
  initialAmenities: Amenity[];
}

export default function AmenityPageClient({
  initialAmenities,
}: AmenityPageClientProps) {
  const { data: session } = useSession();
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      const data = await listAmenities();
      setAmenities(data);
    } catch (error) {
      console.error("Failed to load amenities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (amenityId: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) {
      return;
    }

    try {
      setDeletingId(amenityId);
      await deleteAmenity(amenityId);
      await loadAmenities();
    } catch (error) {
      console.error("Failed to delete amenity:", error);
      alert("Failed to delete amenity. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Amenities
        </Typography>

        {!session?.user ? (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                component={Link}
                href="/auth/signin"
              >
                Sign In
              </Button>
            }
          >
            Sign in to manage amenities
          </Alert>
        ) : (
          <>
            <AmenityCreateForm onSuccess={loadAmenities} />

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Existing Amenities
              </Typography>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : amenities.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No amenities found.
                </Typography>
              ) : (
                <List>
                  {amenities.map((amenity) => (
                    <ListItem
                      key={amenity.amenity_id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(amenity.amenity_id)}
                          disabled={deletingId === amenity.amenity_id}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemText
                        primary={amenityNameToDisplay(amenity.name)}
                        secondary={`ID: ${amenity.amenity_id}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
