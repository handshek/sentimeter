# Feedback Intake

Feedback Intake is the path from a user reaction in an installed widget to a
stored Convex feedback row.

## Entry Points

- Client submitter: `packages/widgets/src/core/submit.ts`
- HTTP action routing: `apps/web/convex/http.ts`
- HTTP action implementation: `apps/web/convex/httpActions.ts`
- Domain rules: `apps/web/convex/lib/feedback-domain.ts`
- Storage mutation: `apps/web/convex/feedback.ts`

## Validation Order

1. Parse JSON body.
2. Require `apiKey`, `location`, `widgetType`, and numeric `value`.
3. Trim optional `text` to 500 characters.
4. Validate widget value by type.
5. Look up active API key.
6. Normalize and enforce allowed origins.
7. Apply global and per-key rate limits.
8. Insert feedback.
9. Return CORS headers that match the project origin policy.

## Widget Value Rules

- `thumbs` accepts `0` and `1`.
- `emoji` accepts integer values from `1` through `5`.
- `star` accepts integer values from `1` through `5`.

## Origin Rules

- Empty `allowedOrigins` means submissions are allowed from any origin.
- A non-empty list requires the request `Origin` to normalize to one of the
  saved origins.
- Saved origins are normalized with `new URL(value).origin`, deduplicated, and
  trimmed before storage.

## Testing

Pure rules live in `apps/web/convex/lib/feedback-domain.ts` so they can be
covered by `bun test` without booting Convex.
