import { getBlockFiles, type BlockDocConfig } from "./block-catalog";
import {
  getInstallCommands,
  packageManagers,
  REPOSITORY_URL,
} from "./widget-catalog";

const blockBehavior: Record<BlockDocConfig["slug"], string> = {
  "floating-feedback":
    "The host chooses the corner. Desktop uses a popover; phones use a bottom sheet. FeedbackForm calls onDone about two seconds after its thank-you appears, closing the container and returning focus to the Feedback pill.",
  "report-problem":
    "The Report a problem button opens FeedbackForm in a dialog. FeedbackForm calls onDone about two seconds after its thank-you appears, closing the dialog and returning focus to the trigger.",
  "error-feedback":
    "Install into a Next.js App Router app. The default export receives error and reset from Next.js. Try again calls reset. The form asks What were you trying to do? Your app owns saving feedback and any error correlation.",
  "was-this-helpful":
    "Place the inline LikeDislike rating after a docs page, help article, or AI answer. It asks Was this helpful? A thumbs-down opens an optional follow-up; a thumbs-up submits immediately.",
  "after-task-rating":
    "The host controls when this block mounts, such as after checkout completes. It shows Order placed and asks How was checkout? A negative emoji opens an optional follow-up; other ratings submit immediately.",
  "cancel-flow-survey":
    "The dialog asks Cancel your Pro plan? and shows the plan end date and cancellation reasons. Keep my plan closes the dialog without cancelling. The host owns the actual cancel action through a callback. Survey onSkip and onDone dismiss the dialog; neither callback cancels a subscription by itself.",
};

export function getBlockMarkdown(block: BlockDocConfig) {
  const commands = getInstallCommands(block.registryName);
  return `# ${block.name}

${block.description}

Kind: ${block.kind}
Situation: ${block.situationGroup}
Source: ${REPOSITORY_URL} (MIT)

## Installation

Requires React, TypeScript, Tailwind CSS, and a configured shadcn project. The block installs readable host-local source and pulls in its Sentimeter component and shadcn dependencies through registryDependencies.

${packageManagers.map((manager) => `### ${manager}\n\n\`\`\`sh\n${commands[manager]}\n\`\`\``).join("\n\n")}

Block files:

${getBlockFiles(block)
  .map((file) => `- \`${file}\``)
  .join("\n")}

The URL commands work without a namespace listing. The planned namespaced command is \`${block.namespacedInstallCommand}\`; it requires a listed namespace or a matching registries entry in components.json.

## Use in your app

${blockBehavior[block.slug]}

Pass a custom submit handler to save feedback to your backend. Without one, the feedback component completes locally and sends or stores nothing. Sentimeter supplies no backend endpoint. Preserve the component's pending, retry, and confirmation behavior when editing the installed file.

## Accessibility and layout

The block inherits the host's shadcn theme. Keep at least 288px of space for feedback components, 44px interaction targets, visible keyboard focus, and focus return when a container closes. The feedback component owns its thank-you; the block owns its surrounding container.
`;
}
