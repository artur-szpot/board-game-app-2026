import axios from "axios";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** Backend 400s always carry a message array; other statuses carry a single string. */
export const extractApiErrorMessages = (error: unknown): string[] => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)
      ?.message;

    if (Array.isArray(message)) {
      const messages = message.filter(
        (entry): entry is string => typeof entry === "string",
      );
      if (messages.length > 0) {
        return messages;
      }
    }

    if (typeof message === "string" && message.length > 0) {
      return [message];
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return [error.message];
  }

  return [GENERIC_MESSAGE];
};
