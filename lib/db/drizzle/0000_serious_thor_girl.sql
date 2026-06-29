CREATE TYPE "public"."category" AS ENUM('climate', 'economic', 'supply_chain');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TABLE "risk_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"category" "category" NOT NULL,
	"risk_score" real NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"source" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"is_anomaly" boolean DEFAULT false NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"source" text NOT NULL,
	"country" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
