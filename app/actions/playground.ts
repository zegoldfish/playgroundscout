"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { encode as encodeGeohash } from "ngeohash";
import { authOptions } from "@/app/auth";
import { CreatePlayground, Playground } from "@/app/schemas/playground";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function checkPlaygroundExists(osmId: string | number): Promise<boolean> {
  try {
    const command = new QueryCommand({
      TableName: "playgrounds",
      IndexName: "osm_id-index",
      KeyConditionExpression: "osm_id = :osmId",
      ExpressionAttributeValues: {
        ":osmId": String(osmId),
      },
    });

    const response = await docClient.send(command);
    return (response.Items?.length ?? 0) > 0;
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    throw error;
  }
}

export async function getPlaygroundByOsmId(osmId: string | number): Promise<{ exists: boolean; playground: Playground | null }> {
  try {
    const command = new QueryCommand({
      TableName: "playgrounds",
      IndexName: "osm_id-index",
      KeyConditionExpression: "osm_id = :osmId",
      ExpressionAttributeValues: {
        ":osmId": String(osmId),
      },
    });

    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      const playground = response.Items[0] as Playground;
      return { exists: true, playground };
    }
    return { exists: false, playground: null };
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    throw error;
  }
}

export async function getPlaygroundById(parkId: string): Promise<Playground | null> {
  try {
    const command = new QueryCommand({
      TableName: "playgrounds",
      KeyConditionExpression: "park_id = :parkId",
      ExpressionAttributeValues: {
        ":parkId": parkId,
      },
    });
    console.log("Querying DynamoDB for park_id:", parkId);
    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      return response.Items[0] as Playground;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    throw error;
  }
}

export async function savePlayground(data: {
  osm_id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  tags?: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const now = new Date().toISOString();
    const osmId = String(data.osm_id);
    
    const playgroundData: CreatePlayground = {
      park_id: `playground-${osmId}`,
      osm_id: osmId,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      location_hash: encodeGeohash(data.latitude, data.longitude, 7),
      osm_tags: data.tags,
      created_at: now,
      updated_at: now,
    };
    
    const command = new PutCommand({
      TableName: "playgrounds",
      Item: playgroundData,
    });

    await docClient.send(command);
    
    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath(`/playground/${playgroundData.park_id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error saving playground to DynamoDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePlayground(
  parkId: string,
  data: Partial<{
    name: string;
    latitude: number;
    longitude: number;
    amenities: string[];
    parkings: string[];
    average_rating: number;
    rating_count: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const updateFields: Record<string, string | number | string[] | boolean> = {};
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};
    let updateExpression = "SET updated_at = :updated_at";
    
    expressionAttributeValues[":updated_at"] = new Date().toISOString();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateExpression += `, #${key} = :${key}`;
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    const command = new UpdateCommand({
      TableName: "playgrounds",
      Key: { park_id: parkId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await docClient.send(command);
    
    // Revalidate the playground detail page to show updates
    revalidatePath(`/playground/${parkId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating playground in DynamoDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
