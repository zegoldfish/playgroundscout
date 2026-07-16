"use server";

import { getServerSession } from "next-auth/next";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
	DynamoDBDocumentClient, 
	PutCommand, 
	GetCommand, 
	DeleteCommand, 
	ScanCommand 
} from "@aws-sdk/lib-dynamodb";
import { authOptions } from "@/app/auth";
import { Parking, CreateParking, UpdateParking } from "@/app/schemas/parking";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PARKINGS_TABLE = "parkings";

// Create Parking
export async function createParking(data: CreateParking): Promise<Parking> {
	const session = await getServerSession(authOptions);
	if (!session) {
		throw new Error("Authentication required");
	}

	// Check for duplicates
	const existingParkings = await listParkings();
	const duplicate = existingParkings.find(
		(parking) => parking.name.toLowerCase().trim() === data.name.toLowerCase().trim()
	);
	
	if (duplicate) {
		throw new Error(`Parking "${data.name}" already exists`);
	}

	const parking_id = crypto.randomUUID();
	const item = { ...data, parking_id };
	await docClient.send(
		new PutCommand({
			TableName: PARKINGS_TABLE,
			Item: item,
		})
	);
		return item as Parking;
	}


// Get Parking by ID
export async function getParkingById(parking_id: string): Promise<Parking | null> {
	const { Item } = await docClient.send(
		new GetCommand({
			TableName: PARKINGS_TABLE,
			Key: { parking_id },
		})
	);
	if (!Item) return null;
	return Item as Parking;

}

// List all Parkings
export async function listParkings(): Promise<Parking[]> {
	const { Items } = await docClient.send(
		new ScanCommand({
			TableName: PARKINGS_TABLE,
		})
	);
	return (Items as Parking[]) || [];
}

// Update Parking
export async function updateParking(data: UpdateParking): Promise<Parking | null> {
	// Only name is updatable
	if (!data.parking_id) return null;
	const { parking_id, name } = data;
	// DynamoDB UpdateCommand is not in lib-dynamodb, so use PutCommand for full replace
	const item = { parking_id, name };
	await docClient.send(
		new PutCommand({
			TableName: PARKINGS_TABLE,
			Item: item,
		})
	);
	return item as Parking;
}

// Delete Parking
export async function deleteParking(parking_id: string): Promise<boolean> {
	const session = await getServerSession(authOptions);
	if (!session) {
		throw new Error("Authentication required");
	}

	await docClient.send(
		new DeleteCommand({
			TableName: PARKINGS_TABLE,
			Key: { parking_id },
		})
	);
	return true;
}
