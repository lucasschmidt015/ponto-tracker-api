#!/usr/bin/env node

import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

// Function to get database config (same as migration script)
function getDatabaseConfig() {
  // Check for DATABASE_URL first (common in production like Heroku, Railway, etc.)
  if (process.env.DATABASE_URL) {
    console.log(`📎 Using DATABASE_URL for connection`);
    return {
      url: process.env.DATABASE_URL,
      dialect: "postgres" as const,
      logging: console.log,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
    };
  }

  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

  if (isProduction) {
    // Production config (matches your prod.ts)
    return {
      database: process.env.DATABASE_NAME || "ponto-tracker",
      username: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASSWORD || "",
      host: process.env.DATABASE_HOST || "localhost",
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT, 10)
        : 5432,
      dialect: "postgres" as const,
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  } else {
    // Development config - try multiple naming conventions
    return {
      database:
        process.env.DB_DATABASE || process.env.DATABASE_NAME || "postgres",
      username:
        process.env.DB_USERNAME || process.env.DATABASE_USER || "postgres",
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || "",
      host: process.env.DB_HOST || process.env.DATABASE_HOST || "localhost",
      port: parseInt(
        process.env.DB_PORT || process.env.DATABASE_PORT || "5432",
      ),
      dialect: "postgres" as const,
      logging: console.log,
    };
  }
}

async function testConnection() {
  console.log("🧪 Database Connection Test");
  console.log("================================");

  // Show environment info
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("");

  // Show available environment variables
  console.log("📋 Available Database Environment Variables:");
  const dbEnvVars = Object.keys(process.env).filter(
    (key) =>
      key.includes("DATABASE") || key.includes("DB_") || key.includes("PG"),
  );

  if (dbEnvVars.length === 0) {
    console.log("   ❌ No database environment variables found!");
  } else {
    dbEnvVars.forEach((key) => {
      const value = process.env[key];
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("pass")
      ) {
        console.log(`   ${key}=***hidden***`);
      } else {
        console.log(`   ${key}=${value}`);
      }
    });
  }
  console.log("");

  try {
    const config = getDatabaseConfig();
    console.log("🔗 Connection Configuration:");

    if (process.env.DATABASE_URL) {
      console.log("   Using DATABASE_URL");
    } else {
      console.log(`   Host: ${config.host}:${config.port}`);
      console.log(`   Database: ${config.database}`);
      console.log(`   User: ${config.username}`);
      console.log(
        `   SSL: ${config.dialectOptions?.ssl ? "enabled" : "disabled"}`,
      );
    }
    console.log("");

    console.log("🔄 Testing connection...");
    const sequelize = new Sequelize(config);

    await sequelize.authenticate();
    console.log("✅ Connection successful!");

    // Test if sequelize_meta table exists
    console.log("🔍 Checking migration table...");
    try {
      const [results] = await sequelize.query(
        "SELECT COUNT(*) as count FROM sequelize_meta",
      );
      const count = (results as { count: string }[])[0]?.count;
      console.log(
        `✅ Migration table exists with ${count} recorded migrations`,
      );
    } catch {
      console.log("⚠️  Migration table (sequelize_meta) does not exist yet");
    }

    await sequelize.close();
    console.log("✅ Connection test completed successfully!");
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
    console.log("");
    console.log("🔧 Troubleshooting tips:");
    console.log("1. Check if database server is running");
    console.log("2. Verify connection details in environment variables");
    console.log("3. Check firewall/security group settings");
    console.log("4. Ensure database user has proper permissions");
    console.log("5. For production, verify SSL requirements");
    process.exit(1);
  }
}

void testConnection();
