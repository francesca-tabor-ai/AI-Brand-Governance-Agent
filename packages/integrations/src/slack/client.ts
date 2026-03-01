import { WebClient } from "@slack/web-api";
import type { KnownBlock } from "@slack/web-api";

export interface SlackConfig {
  botToken: string;
  channels: {
    critical: string;
    warnings: string;
    info: string;
  };
}

/**
 * Wrapper around Slack Web API for governance notifications.
 */
export class SlackClient {
  private web: WebClient;
  private channels: SlackConfig["channels"];

  constructor(config: SlackConfig) {
    this.web = new WebClient(config.botToken);
    this.channels = config.channels;
  }

  /** Post a Block Kit message to a channel. Returns the message timestamp. */
  async postMessage(
    channel: string,
    blocks: KnownBlock[],
    text: string,
  ): Promise<string | undefined> {
    const result = await this.web.chat.postMessage({
      channel,
      blocks,
      text, // fallback for notifications
    });
    return result.ts;
  }

  /** Post a threaded reply to an existing message. */
  async postReply(
    channel: string,
    threadTs: string,
    blocks: KnownBlock[],
    text: string,
  ): Promise<void> {
    await this.web.chat.postMessage({
      channel,
      thread_ts: threadTs,
      blocks,
      text,
    });
  }

  /** Get the channel name for a given severity level. */
  getChannel(severity: "critical" | "warning" | "info"): string {
    switch (severity) {
      case "critical":
        return this.channels.critical;
      case "warning":
        return this.channels.warnings;
      case "info":
        return this.channels.info;
    }
  }
}
