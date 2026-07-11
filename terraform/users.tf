/* Users table for Auth.js sessions and user profiles */
resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # GSI for email lookups
  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout Users"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

/* Sessions table for Auth.js session management */
resource "aws_dynamodb_table" "sessions" {
  name           = "sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "sessionToken"

  attribute {
    name = "sessionToken"
    type = "S"
  }

  ttl {
    attribute_name = "expires"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout Sessions"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

/* Accounts table for Auth.js OAuth providers */
resource "aws_dynamodb_table" "accounts" {
  name           = "accounts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "provider"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "provider"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout OAuth Accounts"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

/* Verification tokens table for Auth.js */
resource "aws_dynamodb_table" "verification_tokens" {
  name           = "verification_tokens"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "token"

  attribute {
    name = "token"
    type = "S"
  }

  ttl {
    attribute_name = "expires"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout Verification Tokens"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

/* Playground ratings table - user-specific ratings and notes */
resource "aws_dynamodb_table" "playground_ratings" {
  name           = "playground_ratings"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "playground_id"
  range_key      = "user_id"

  attribute {
    name = "playground_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout Ratings"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

output "users_table_name" {
  description = "Name of the Users table"
  value       = aws_dynamodb_table.users.name
}

output "playground_ratings_table_name" {
  description = "Name of the Playground Ratings table"
  value       = aws_dynamodb_table.playground_ratings.name
}
