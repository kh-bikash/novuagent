# Relay

Relay is a polished incident-concierge demo built around Novu's strongest product story: one application event can notify the right person, start a two-way agent conversation, request human approval, and update every channel when the incident is resolved.

Relay is an original demo application, not an official Novu interface. It is designed to show how a product can build on Novu's open-source, self-hostable communication infrastructure while keeping its own agent logic and user experience.

## Run it

```bash
npm start
```

Open `http://127.0.0.1:4173`.

The product is self-contained and uses browser storage, so it works without API credentials. Use **Simulate incident** to create new events, open an incident to approve or reject an action, chat with the agent, switch views, and edit channel preferences.

## Demo video

The repository includes a narration-free, 88-second recording of the real localhost product flow at 1600×900 and 30 fps:

[Watch the full Relay workflow](videos/relay-real-workflow-demo.mp4)

Re-record it after UI changes with `npm run demo:record`. The recorder uses real DOM targets, visible character-by-character typing, verified approval state, accurate pointer movement, and brief target-centered zooms.

## What the demo shows

1. An application event triggers the `critical-incident` workflow.
2. **Novu Notify** routes one notification to the in-app inbox, Slack, and an email fallback according to subscriber preferences.
3. **Novu Connect** keeps the incident conversation in context while Atlas explains impact and risk.
4. A human approves or rejects the proposed action in the same thread.
5. The final state is updated in place across every active channel.

The UI exposes the workflow ID, subscriber ID, active delivery count, conversation, approval, and synchronized outcome so the entire communication lifecycle is visible—not just the notification card.

## Connect a real Novu environment

Relay includes a server-side Novu adapter. Copy the values in `.env.example` into your deployment platform's secret/environment settings. Never put `NOVU_SECRET_KEY` in frontend code or commit it to Git.

```js
await novu.trigger({
  workflowId: 'critical-incident',
  to: [{ subscriberId: 'on-call:maya' }],
  payload: incident,
});
```

Recommended workflow IDs:

- `incident-created`
- `incident-approval-requested`
- `incident-resolved`
- `incident-snoozed`

Map `subscriberId` to the on-call user and pass the incident payload as workflow data. Novu can then deliver through Inbox, Slack, and email fallback while Relay remains the operational surface.

Without `NOVU_SECRET_KEY`, the server deliberately reports **preview mode** and preserves the full local workflow. With the secret configured, the same actions call the official `@novu/api` SDK. `NOVU_API_URL` supports Novu Cloud, regional endpoints, or a self-hosted API.

## Deploy

The server listens on `0.0.0.0` and respects `PORT`, so it can run directly on a Node hosting platform or from the included Dockerfile.

```bash
docker build -t relay .
docker run --env-file .env -p 4173:4173 relay
```

Health check: `GET /api/health`

Novu itself is open source and supports self-hosted or managed deployments. See [novu.co](https://novu.co/) and the [Novu GitHub repository](https://github.com/novuhq/novu) for the production SDKs, infrastructure, and deployment options.
