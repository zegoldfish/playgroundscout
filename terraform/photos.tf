resource "aws_s3_bucket" "playground_photos" {
  bucket = "playgroundscoutnet"
}

resource "aws_s3_bucket_ownership_controls" "playground_photos" {
  bucket = aws_s3_bucket.playground_photos.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "playground_photos" {
  bucket = aws_s3_bucket.playground_photos.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "playground_photos" {
  depends_on = [
    aws_s3_bucket_ownership_controls.playground_photos,
    aws_s3_bucket_public_access_block.playground_photos,
  ]

  bucket = aws_s3_bucket.playground_photos.id
  acl    = "public-read"
}

resource "aws_s3_bucket_cors_configuration" "playground_photos" {
  bucket = aws_s3_bucket.playground_photos.id

  cors_rule {
    allowed_headers = ["Content-Type", "Authorization"]
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["http://localhost:3000", "https://playgroundscout.net"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "playground_photos" {
  bucket = aws_s3_bucket.playground_photos.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.playground_photos.arn}/*"
      }
    ]
  })
}
