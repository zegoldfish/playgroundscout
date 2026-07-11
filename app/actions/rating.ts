"use server";

import { revalidatePath } from "next/cache";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { RatingRecord } from "@/app/schemas/rating";
import { updatePlayground } from "@/app/actions/playground";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const RATINGS_TABLE = "playground_ratings";

export async function getUserRating(playgroundId: string, userId: string): Promise<RatingRecord | null> {
  try {
    const { Item } = await docClient.send(
      new GetCommand({
        TableName: RATINGS_TABLE,
        Key: {
          playground_id: playgroundId,
          user_id: userId,
        },
      })
    );
    return Item ? (Item as RatingRecord) : null;
  } catch (error) {
    console.error("Error fetching user rating:", error);
    throw error;
  }
}

export async function getPlaygroundRatings(playgroundId: string): Promise<RatingRecord[]> {
  try {
    const { Items } = await docClient.send(
      new QueryCommand({
        TableName: RATINGS_TABLE,
        KeyConditionExpression: "playground_id = :playgroundId",
        ExpressionAttributeValues: {
          ":playgroundId": playgroundId,
        },
      })
    );
    return (Items as RatingRecord[]) || [];
  } catch (error) {
    console.error("Error fetching playground ratings:", error);
    throw error;
  }
}

export async function saveUserRating(
  playgroundId: string,
  userId: string,
  data: {
    rating: number;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const ratingRecord: RatingRecord = {
      playground_id: playgroundId,
      user_id: userId,
      rating: data.rating,
      notes: data.notes,
      created_at: now,
      updated_at: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: RATINGS_TABLE,
        Item: ratingRecord,
      })
    );

    // Recalculate and update the playground's average rating
    const allRatings = await getPlaygroundRatings(playgroundId);
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : undefined;

    if (avgRating) {
      await updatePlayground(playgroundId, {
        average_rating: parseFloat(avgRating.toFixed(1)),
        rating_count: allRatings.length,
      });
    }

    // Revalidate the playground detail page to show updated ratings
    revalidatePath(`/playground/${playgroundId}`);

    return { success: true };
  } catch (error) {
    console.error("Error saving rating:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAverageRating(playgroundId: string): Promise<{
  average?: number;
  count: number;
}> {
  try {
    const ratings = await getPlaygroundRatings(playgroundId);
    if (ratings.length === 0) {
      return { count: 0 };
    }

    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    return {
      average: parseFloat(average.toFixed(1)),
      count: ratings.length,
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    throw error;
  }
}
