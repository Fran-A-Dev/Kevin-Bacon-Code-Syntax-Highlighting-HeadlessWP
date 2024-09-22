import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";

async function getPosts() {
  const query = `
  {
    posts(first: 5) {
      nodes {
        title
        content
        uri
      }
    }
  }
  `;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}?query=${encodeURIComponent(
      query
    )}`,
    { next: { revalidate: 10 } },
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const { data } = await res.json();

  return data.posts.nodes;
}

export default async function PostList() {
  const posts = await getPosts();

  return (
    <Suspense fallback={<Loading />}>
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.uri}>
            <Link href={`post${post.uri}`}>
              <h3>{post.title}</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: post.content.slice(0, 200) + "...",
                }}
              />
            </Link>
          </div>
        ))}
      </div>
    </Suspense>
  );
}
