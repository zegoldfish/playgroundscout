"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { listParkings, deleteParking } from "@/app/actions/parking";
import ParkingCreateForm from "@/app/components/ParkingCreateForm";
import { Parking } from "@/app/schemas/parking";
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

interface ParkingPageClientProps {
  initialParkings: Parking[];
}

export default function ParkingPageClient({
  initialParkings,
}: ParkingPageClientProps) {
  const { data: session } = useSession();
  const [parkings, setParkings] = useState<Parking[]>(initialParkings);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadParkings = async () => {
    try {
      setIsLoading(true);
      const data = await listParkings();
      setParkings(data);
    } catch (error) {
      console.error("Failed to load parkings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (parkingId: string) => {
    if (!confirm("Are you sure you want to delete this parking?")) {
      return;
    }

    try {
      setDeletingId(parkingId);
      await deleteParking(parkingId);
      await loadParkings();
    } catch (error) {
      console.error("Failed to delete parking:", error);
      alert("Failed to delete parking. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Parkings
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
            Sign in to manage parkings
          </Alert>
        ) : (
          <>
            <ParkingCreateForm onSuccess={loadParkings} />

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Existing Parkings
              </Typography>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : parkings.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No parkings found.
                </Typography>
              ) : (
                <List>
                  {parkings.map((parking) => (
                    <ListItem
                      key={parking.parking_id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(parking.parking_id)}
                          disabled={deletingId === parking.parking_id}
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
                        primary={parking.name}
                        secondary={`ID: ${parking.parking_id}`}
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
