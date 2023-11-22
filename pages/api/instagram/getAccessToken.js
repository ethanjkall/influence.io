import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";

async function getUserId(email) {
  const userId = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
    },
  });

  return userId.id;
}

async function getInstagramAccessToken(email) {
  const userId = await getUserId(email);

  // Find the user by email and return the account token if it exists, else return null
  var accountToken = await prisma.AccountToken.findFirst({
    where: {
      userId: userId,
      name: "instagram",
    },
  });

  if (accountToken) {
    // Check if token has expired
    if (accountToken.expires < Date.now()) {
      // Delete the record
      await prisma.AccountToken.delete({
        where: {
          id: accountToken.id,
        },
      });
      accountToken = null;
    }
  }

  return accountToken;
}

export default async function handler(req, res) {
  // Get user email from session
  const session = await getServerSession(req, res);
  const email = session.user.email;

  if (req.method === "GET") {
    // Returns access token if it exists in the database and is not expired, else return error
    try {
      const accountToken = await getInstagramAccessToken(email);

      // Check if user has an access token, will either return an accountToken or return error code 404
      if (accountToken) {
        return res.status(200).json({ accountToken });
      } else {
        return res.status(404).json({ accountToken });
      }
    } catch (error) {
      console.error(
        "Error fetching Instagram access token from database: ",
        error.message
      );
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    // User does not have an access token, generate one using code and add it to database
    try {
      // Make API call using code to retrieve short lived access token
      const { code, redirectUri } = req.body;
      var clientId = process.env.INSTAGRAM_CLIENT_ID;
      var clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
      var address = `https://api.instagram.com/oauth/access_token`;
      console.log(clientId);
      console.log(clientSecret);
      console.log(code);
      console.log(redirectUri);
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        return res.status(response.status).json({
          message: `Failed to fetch short-lived Instagram access token from API: ${errorMessage}`,
        });
      }

      // TODO: Make another API call to retrieve long lived access token
      const data = await response.json();
      const accessToken = data.access_token;
      var clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
      var address = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${accessToken}`;
      const finalResponse = await fetch(address, {
        method: "GET",
      });

      if (!finalResponse.ok) {
        const errorMessage = await finalResponse.text();
        return res.status(finalResponse.status).json({
          message: `Failed to fetch long-lived Instagram access token from API: ${errorMessage}`,
        });
      }

      const finalData = await finalResponse.json();
      console.log(finalData);

      // Add access token to database and return the new account token
      const userId = await getUserId(email);
      const accountToken = await prisma.AccountToken.create({
        data: {
          userId: userId,
          name: "instagram",
          accessToken: finalData.access_token,
          tokenType: finalData.token_type,
          expires: new Date(Date.now() + finalData.expires_in * 1000),
        },
      });

      return res.status(200).json({ accountToken });
    } catch (error) {
      console.error("Error fetching Instagram access token: ", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
