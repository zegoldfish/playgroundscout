resource "aws_dynamodb_table" "amenities" {
	name           = "amenities"
	billing_mode   = "PAY_PER_REQUEST"
	hash_key       = "amenity_id"

	attribute {
		name = "amenity_id"
		type = "S"
	}

	point_in_time_recovery {
		enabled = true
	}
}
