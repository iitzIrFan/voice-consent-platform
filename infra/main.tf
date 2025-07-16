terraform {
  required_version = ">= 1.5.0"
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 0.9"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 0.6"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
  organization_id = var.supabase_org_id
}

provider "upstash" {
  email = var.upstash_email
  api_key = var.upstash_api_key
}

provider "aws" {
  region = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

module "supabase_project" {
  source  = "supabase/project/supabase"
  version = "0.9.2"
  name    = var.project_name
}

resource "upstash_redis_database" "consent" {
  database_name = "consent-queue"
  region        = var.upstash_region
  multizone     = false
}

resource "aws_s3_bucket" "minio" {
  bucket = var.minio_bucket
}
