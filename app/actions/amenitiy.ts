"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
	DynamoDBDocumentClient, 
	PutCommand, 
	GetCommand, 
	DeleteCommand, 
	ScanCommand 
} from "@aws-sdk/lib-dynamodb";
import { Amenity, CreateAmenity, UpdateAmenity } from "@/app/schemas/amenity";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const AMENITIES_TABLE = "amenities";

// Create Amenity
export async function createAmenity(data: CreateAmenity): Promise<Amenity> {
	// Check for duplicates
	const existingAmenities = await listAmenities();
	const duplicate = existingAmenities.find(
		(amenity) => amenity.name.toLowerCase().trim() === data.name.toLowerCase().trim()
	);
	
	if (duplicate) {
		throw new Error(`Amenity "${data.name}" already exists`);
	}

	const amenity_id = crypto.randomUUID();
	const item = { ...data, amenity_id };
	await docClient.send(
		new PutCommand({
			TableName: AMENITIES_TABLE,
			Item: item,
		})
	);
		return item as Amenity;
	}


// Get Amenity by ID
export async function getAmenityById(amenity_id: string): Promise<Amenity | null> {
	const { Item } = await docClient.send(
		new GetCommand({
			TableName: AMENITIES_TABLE,
			Key: { amenity_id },
		})
	);
	if (!Item) return null;
	return Item as Amenity;

}

// List all Amenities
export async function listAmenities(): Promise<Amenity[]> {
	const { Items } = await docClient.send(
		new ScanCommand({
			TableName: AMENITIES_TABLE,
		})
	);
	return (Items as Amenity[]) || [];
}

// Update Amenity
export async function updateAmenity(data: UpdateAmenity): Promise<Amenity | null> {
	// Only name is updatable
	if (!data.amenity_id) return null;
	const { amenity_id, name } = data;
	// DynamoDB UpdateCommand is not in lib-dynamodb, so use PutCommand for full replace
	const item = { amenity_id, name };
	await docClient.send(
		new PutCommand({
			TableName: AMENITIES_TABLE,
			Item: item,
		})
	);
	return item as Amenity;
}

// Delete Amenity
export async function deleteAmenity(amenity_id: string): Promise<boolean> {
	await docClient.send(
		new DeleteCommand({
			TableName: AMENITIES_TABLE,
			Key: { amenity_id },
		})
	);
	return true;
}
