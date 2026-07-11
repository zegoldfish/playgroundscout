resource "aws_dynamodb_table" "parkings" {
	name           = "parkings"
	billing_mode   = "PAY_PER_REQUEST"
	hash_key       = "parking_id"

	attribute {
		name = "parking_id"
		type = "S"
	}

	point_in_time_recovery {
		enabled = true
	}
}
