"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { authOptions } from "@/app/auth";
import { hasElevatedAccess } from "@/app/utils/userRole";
import { getPlaygroundById } from "@/app/actions/playground";

const s3Client = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const BUCKET = process.env.S3_PHOTOS_BUCKET!;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function getPhotoUploadUrl(
  parkId: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; photoKey: string } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Authentication required" };
  if (!hasElevatedAccess((session.user as any).role))
    return { error: "Editor role required" };

  const key = `playgrounds/${parkId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, photoKey: key };
}

export async function getPresignedPhotoUrl(
  photoKey: string
): Promise<{ url: string } | { error: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: photoKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url };
  } catch (error) {
    console.error("Error generating presigned photo URL:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function addPhotoToPlayground(
  parkId: string,
  photoKey: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Authentication required" };
  if (!hasElevatedAccess((session.user as any).role))
    return { success: false, error: "Editor role required" };

  try {
    const command = new UpdateCommand({
      TableName: "playgrounds",
      Key: { park_id: parkId },
      UpdateExpression:
        "SET photos = list_append(if_not_exists(photos, :empty), :newPhoto), updated_at = :now",
      ExpressionAttributeValues: {
        ":newPhoto": [photoKey],
        ":empty": [],
        ":now": new Date().toISOString(),
      },
    });

    await docClient.send(command);
    revalidatePath(`/playground/${parkId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding photo to playground:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function removePhotoFromPlayground(
  parkId: string,
  photoKey: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Authentication required" };
  if (!hasElevatedAccess((session.user as any).role))
    return { success: false, error: "Editor role required" };

  try {
    const playground = await getPlaygroundById(parkId);
    if (!playground) return { success: false, error: "Playground not found" };

    const updatedPhotos = (playground.photos ?? []).filter((p) => p !== photoKey);

    const command = new UpdateCommand({
      TableName: "playgrounds",
      Key: { park_id: parkId },
      UpdateExpression: "SET photos = :photos, updated_at = :now",
      ExpressionAttributeValues: {
        ":photos": updatedPhotos,
        ":now": new Date().toISOString(),
      },
    });

    await docClient.send(command);
    revalidatePath(`/playground/${parkId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing photo from playground:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
