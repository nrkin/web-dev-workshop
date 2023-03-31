import HeaderImage from "@/components/Profile/HeaderImage";
import HeaderProfilePicture from "@/components/Profile/HeaderProfilePicture";
import { Calendar } from "phosphor-react";
import Head from "next/head";
import TweetFeed from "@/components/TweetFeed";
import Link from "next/link";
import strings from "@/constants/ui/strings";
import { useRouter } from "next/router";
import UserNotFound from "@/components/Error/UserNotFound";
import { BASE_URL } from "@/constants/routes";
import { useState, useEffect } from "react";
import { getHumanReadableDate } from "@/utils/date";

export default function ProfilePage({ user, tweets, followCounts }) {
  const uiTextFollow = strings.EN.FOLLOW;
  const uiTextProfile = strings.EN.PROFILE;
  const uiTextSite = strings.EN.SITE;
  const title = `${uiTextSite.home} / ${uiTextSite.woofer}`;
  const [userIsSelf, setUserIsSelf] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const handle = localStorage.getItem("userHandle");
    if (handle === router.query.profile) {
      setUserIsSelf(true);
    }
  }, []);

  const followUser = () => {
    fetch(`${BASE_URL}/followers/${user.id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            // @TODO: Change "Follow" to "Following"
            console.log("Follower created", data);
          });
        } else {
          response.json().then((data) => {
            console.error(data.message);
          });
        }
      })
      .catch((error) => {
        console.error("Error following user", error);
      });
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <HeaderImage />
        <div className="grid grid-flow-col space-between">
          <div className="-mt-16 pl-8">
            <HeaderProfilePicture handle={user.handle} />
          </div>
          <div className="mt-6 text-right mr-6">
            {userIsSelf ? null : (
              <button
                onClick={followUser}
                className="border border-gray-600 rounded-full px-8 py-1"
              >
                {uiTextFollow.follow}
              </button>
            )}
          </div>
        </div>
        <div className="px-4 mt-8">
          <p className="font-bold">{user.name}</p>
          <p className="text-gray-500">@{user.handle}</p>
          <p>{user.bio}</p>
          <div className="flex justify-start items-center gap-2 mt-4 text-gray-500">
            <Calendar size={24} className="text-gray-500" />
            <p className="text-sm">
              {uiTextProfile.joined} {getHumanReadableDate(user.createdAt)}
            </p>
          </div>

          <div className="mt-4 flex justify-start gap-6">
            <Link href={`/${user.handle}/following`}>
              <b>{followCounts.following}</b> {uiTextFollow.following}
            </Link>

            <Link href={`/${user.handle}/followers`}>
              <b>{followCounts.followers}</b> {uiTextFollow.followers}
            </Link>
          </div>
        </div>
        <hr className="my-6" />
        <div>
          <h2 className="text-xl font-bold px-4">{uiTextProfile.woofs}</h2>
          <TweetFeed tweets={tweets} />
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ res, params }) {
  try {
    if (params.profile) {
      const [profileRes, tweetsRes, followCountsRes] = await Promise.all([
        fetch(`${BASE_URL}/user/handle/${params.profile}`),
        fetch(`${BASE_URL}/tweets/handle/${params.profile}`),
        fetch(`${BASE_URL}/followers/count/${params.profile}`),
      ]);
      const profileResBody = await profileRes.json();
      const tweetsResBody = await tweetsRes.json();
      const followCountsResBody = await followCountsRes.json();

      if (!profileResBody.data.user) {
        throw new Error("No such user exists");
      }

      return {
        props: {
          user: profileResBody.data.user,
          tweets: tweetsResBody.data.tweets,
          followCounts: followCountsResBody.data,
        },
      };
    }
  } catch (error) {
    res.writeHead(302, { Location: "/home" });
    res.end();
  }
}