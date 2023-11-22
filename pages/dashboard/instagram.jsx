import RootLayout from "@/components/Layout";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaInstagram } from "react-icons/fa";

const Analytics = () => {
  const [hasInstagramClient, setHasInstagramClient] = useState(false);
  const [hasCheckedDatabase, setHasCheckedDatabase] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const checkAccessTokenInDatabase = async () => {
    // Check if access token exists in the database
    const response = await fetch(`/api/instagram/getAccessToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      setAccessToken(responseData.accountToken.accessToken);
      setHasInstagramClient(true);
    }
    setHasCheckedDatabase(true);
  };

  // Check for access token in database before page is rendered
  useEffect(() => {
    checkAccessTokenInDatabase();
  }, []);

  return (
    <div>
      {hasCheckedDatabase &&
        (!hasInstagramClient ? (
          <InstagramLoginButton
            accessToken={accessToken}
            setHasInstagramClient={setHasInstagramClient}
            setAccessToken={setAccessToken}
          />
        ) : (
          <div>
            <InstagramAnalyticsData accessToken={accessToken}/>
          </div>
        ))}
    </div>
  );;
};

function InstagramAnalyticsData({accessToken}) {

  const [totalFollowers, setTotalFollowers] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  async function getApiData() {
    // Make API call to backend to retrieve data from Instagram API
    const res = await fetch(`/api/instagram/getApiData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken
      })
    });

    const response = await res.json();
    setTotalFollowers(response.totalFollowers);
    setTotalLikes(response.totalLikes);
    setTotalPosts(response.totalPosts);
  }

  getApiData();

  return (
    <div className="flex flex-col m-auto p-10">
      <div className="flex felx-row justify-between p-5">
        <div className="items-center w-3/12 p-4 border border-gray-200 rounded-lg shadow dark:bg-gray-600 dark:border-gray-700">
          <h4 className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">Followers</h4>
          <h3 className="mb-3 font-xl text-gray-700 dark:text-gray-400">{totalFollowers}</h3>
        </div>
        <div className="items-center w-3/12 p-4 border border-gray-200 rounded-lg shadow dark:bg-gray-600 dark:border-gray-700">
          <h4 className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">Total Likes</h4>
          <h3 className="mb-3 font-xl text-gray-700 dark:text-gray-400">{totalLikes}</h3>
        </div>
        <div className="items-center w-3/12 p-4 border border-gray-200 rounded-lg shadow dark:bg-gray-600 dark:border-gray-700">
          <h4 className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">Total Posts</h4>
          <h3 className="mb-3 font-xl text-gray-700 dark:text-gray-400">{totalPosts}</h3>
        </div>
      </div>
    </div>
  );
}

function InstagramLoginButton({
  setHasInstagramClient,
  setAccessToken,
}) {
  const router = useRouter();

  const initiateInstagramLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = window.location.origin + "/dashboard/instagram";
    const scope = "user_profile,user_media,instagram_graph_user_profile";
    const instagramLoginUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    window.location.href = instagramLoginUrl;
  };

  const handleInstagramCallback = async () => {
    // get code from url after redirect
    const code = router.query.code;
    const redirectUri = window.location.origin + "/dashboard/instagram";

    // send a POST request to backend with code. Backend will send GET request to Instagram API and retrieve the access_token
    if (code) {
      const response = await fetch("/api/instagram/getAccessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          redirectUri,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        // setAccessToken(responseData.accountToken.accessToken);
        // setHasInstagramClient(true);
      } else {
        const errorMessage = await response.text();
        console.error(`Failed to get access token: ${errorMessage}`);
      }
    }
  };

  // Check for Instagram callback when code is added to url after FB login redirect
  useEffect(() => {
    handleInstagramCallback();
  }, [router.query.code]);

  return (
    <div className="flex flex-col p-5 items-center">
      <div className=" p-5 items-center">
        <button
          onClick={() => initiateInstagramLogin()}
          className="flex-row gap-3 item-center border-2 rounded-full text-sm px-5 py-2 inline-block hover-bg-gray-600 hover-text-white"
        >
          <div>Add Instagram Account</div>
          <FaInstagram className="text-lg" />
        </button>
      </div>
    </div>
  );
}

Analytics.getLayout = (page) => (
  <RootLayout>
    <DashboardLayout>{page}</DashboardLayout>
  </RootLayout>
);

export default Analytics;
