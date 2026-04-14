export type {
  WidgetCallbacks,
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetType,
} from "./types";

export {
  DEFAULT_FEEDBACK_ENDPOINT,
  submitFeedback,
} from "./core/submit";

export { EmojiFeedback } from "./emoji-feedback";
export { LikeDislike } from "./like-dislike";
export { StarRating } from "./star-rating";

// Compound components
export {
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackInput,
  FeedbackFooter,
  useFeedbackContext,
  type WidgetSize,
} from "./compound";

export type {
  FeedbackWidgetProps,
  FeedbackTitleProps,
  FeedbackDescriptionProps,
  FeedbackRatingProps,
  FeedbackInputProps,
  FeedbackFooterProps,
} from "./compound";
