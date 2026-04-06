CREATE TABLE "saved_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"site_name" text NOT NULL,
	"site_type" text NOT NULL,
	"description" text NOT NULL,
	"colors" text,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
