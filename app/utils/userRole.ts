import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export type UserRole = "admin" | "user";

/**
 * Looks up a user by email in DynamoDB. If the user does not exist, creates
 * a new record with the default "user" role. Returns the user's role.
 */
export async function ensureUserExists(
  email: string,
  name?: string | null
): Promise<UserRole> {
  try {
    const { Items } = await docClient.send(
      new QueryCommand({
        TableName: "users",
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (Items && Items.length > 0) {
      return (Items[0].role as UserRole) ?? "user";
    }

    // First-time sign-in: create user with default "user" role
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name: name ?? null,
      role: "user" as UserRole,
      created_at: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: "users",
        Item: newUser,
        ConditionExpression: "attribute_not_exists(id)",
      })
    );

    return "user";
  } catch (error) {
    console.error("Error ensuring user exists in DynamoDB:", error);
    // Fail safe: treat unknown users as regular users
    return "user";
  }
}
