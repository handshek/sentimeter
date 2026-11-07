"use client";

import { LikeDislike, type LikeDislikeProps } from "../like-dislike";

export type WasThisHelpfulProps = Pick<
  LikeDislikeProps,
  "submit" | "location" | "title"
>;

export function WasThisHelpful({
  submit,
  location = "was-this-helpful",
  title = "Was this helpful?",
}: WasThisHelpfulProps) {
  return (
    <div className="mt-10 border-t pt-6">
      <LikeDislike
        layout="inline"
        title={title}
        submit={submit}
        location={location}
      />
    </div>
  );
}
