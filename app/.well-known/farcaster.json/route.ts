import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    "frame": {
      "name": "nadArcade",
      "version": "1",
      "iconUrl": "https://monad-mini-app-five.vercel.app/icon.png",
      "homeUrl": "https://monad-mini-app-five.vercel.app",
      "imageUrl": "https://monad-mini-app-five.vercel.app/image.png",
      "splashImageUrl": "https://monad-mini-app-five.vercel.app/splash.png",
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
