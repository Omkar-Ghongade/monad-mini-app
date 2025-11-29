import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    "frame": {
      "name": "nadArcade",
      "version": "1",
      "iconUrl": "https://i.ibb.co/20ZM5yZB/Whats-App-Image-2025-11-29-at-12-27-46-d3bcf721.jpg",
      "homeUrl": "https://monad-mini-app-five.vercel.app",
      "imageUrl": "https://monad-mini-app-five.vercel.app/image.png",
      "splashImageUrl": "https://i.ibb.co/WW2HbFmy/Nad-Arcade.png",
      "splashBackgroundColor": "#6200EA",
      "webhookUrl": "https://monad-mini-app-five.vercel.app/api/webhook",
      "subtitle": "Nostalgic Game",
      "description": "testing",
      "primaryCategory": "games"
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjExNTEyMjcsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhiYURmNzA5RDA1NUQ3M2I2RDg4NjAyMzdlMTkxNTAxM2NhYzBmNGYzIn0",
      "payload": "eyJkb21haW4iOiJtb25hZC1taW5pLWFwcC1maXZlLnZlcmNlbC5hcHAifQ",
      "signature": "YkUHIxlccGb+xtBr7TJmj8mooDKLoJQ87plp0KPlUPEDM5RiZuFdo6AZu5D1zjxhLuWaTvS0hnsXPokU0Dza6xs="
    }
  };

  return NextResponse.json(farcasterConfig);
}
