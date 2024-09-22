"use client";
import { useState } from "react";
import "../../globals.css";

async function getPost(uri) {
  const query = `
  query GetPostByUri($uri: ID!) {
    post(id: $uri, idType: URI) {
      title
      editorBlocks {
        name
        ... on KevinbatdorfCodeBlockPro {
          attributes {
            language
            lineNumbers
            code
            copyButton
            copyButtonString
          }
          renderedHtml
        }
      }
    }
  }
  `;

  const variables = {
    uri,
  };

  const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseBody = await res.json();
  return responseBody.data.post;
}

export default async function PostDetails({ params }) {
  const post = await getPost(params.uri);

  return (
    <main>
      <h1>{post.title}</h1>
      <div>
        {/* Loop through the editor blocks to render CodeBlockPro if available */}
        {post.editorBlocks.map((block, index) => {
          if (block.name === "kevinbatdorf/code-block-pro") {
            return (
              <CodeBlockDisplay
                key={index}
                attributes={block.attributes}
                renderedHtml={block.renderedHtml}
              />
            );
          }
          return null;
        })}
      </div>
    </main>
  );
}

// CodeBlockDisplay inline function to display code block
function CodeBlockDisplay({ attributes, renderedHtml }) {
  const [copied, setCopied] = useState(false);

  // Handle copy button functionality
  const handleCopy = async () => {
    try {
      if (navigator && navigator.clipboard) {
        console.log("Copying the text:", attributes.code);
        await navigator.clipboard.writeText(attributes.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
      } else {
        console.error("Clipboard API not available.");
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="code-block-container">
      {/* Render the HTML of the code block */}
      <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />

      {/* Show the copy button */}
      {attributes.copyButton && (
        <button onClick={handleCopy} className="copy-button" title="Copy">
          {copied ? <CheckMarkIcon /> : <CopyIcon />}
        </button>
      )}

      {/* Show the language at the bottom */}
      {attributes.language && (
        <div className="language-label-right">
          {attributes.language}
          <span className="language-label">{attributes.language}</span>
        </div>
      )}
    </div>
  );
}

function CheckMarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      strokeWidth={5}
      stroke="currentColor"
      className="h-6 w-6 text-gray-500 hover:text-gray-400"
    >
      <rect x="11.13" y="17.72" width="33.92" height="36.85" rx="2.5" />
      <path d="M19.35,14.23V13.09a3.51,3.51,0,0,1,3.33-3.66H49.54a3.51,3.51,0,0,1,3.33,3.66V42.62a3.51,3.51,0,0,1-3.33,3.66H48.39" />
    </svg>
  );
}
