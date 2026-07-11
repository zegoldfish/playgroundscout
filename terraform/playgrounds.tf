resource "aws_dynamodb_table" "playgrounds" {
  name           = "playgrounds"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "park_id"

  attribute {
    name = "park_id"
    type = "S"
  }

  # Optional: Add GSI for querying by osm_id if needed
  attribute {
    name = "osm_id"
    type = "S"
  }

  global_secondary_index {
    name            = "osm_id-index"
    hash_key        = "osm_id"
    projection_type = "ALL"
  }

  # Optional: Add GSI for querying by location if needed
  attribute {
    name = "location_hash"
    type = "S"
  }

  global_secondary_index {
    name            = "location-index"
    hash_key        = "location_hash"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "PlaygroundScout Playgrounds"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.playgrounds.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.playgrounds.arn
}
