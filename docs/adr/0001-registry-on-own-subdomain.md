# 0001: Give the registry its own subdomain

Status: accepted. The custom domain is pending; current hosts remain configured
in [site.config.ts](../../apps/registry/site.config.ts).

## Context

Developers copy Sentimeter registry URLs into their `components.json` registry
mapping and install commands. Registry dependencies also embed the host URL.
Changing these URLs after launch would require changes in consumers' projects.
The public Next.js site and the registry JSON have different serving needs.

## Decision

Serve registry JSON from a Cloudflare Worker at `registry.<domain>`. Serve the
public site from Vercel at the apex domain. Keep `SITE_URL`, `REGISTRY_URL`, and
`REPOSITORY_URL` in one source file. Registry generation and the public catalog
import those constants.

Until the domain is supplied, keep `try-sentimeter.vercel.app` for the site and
`registry.handshek.workers.dev` for registry installs. Do not publish the shadcn
directory entry until the stable registry domain resolves.

## Consequences

The registry can deploy independently of the website. A Worker Custom Domain
owns routing and TLS for its subdomain without tying install URLs to a Vercel
route. The stable URL becomes a compatibility commitment for future releases.

To switch hosts, follow the [runbook](../ops/runbook.md): change the constants,
configure the Worker custom domain, regenerate registry output, update copied
examples, deploy both hosts, and verify a fresh install. Generated registry JSON
is build output and must not be edited by hand.
