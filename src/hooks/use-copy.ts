import { useState } from "react";



/**
 * This hook provides functionality to copy a given text to the clipboard and manage the copied state.
 * @returns An object containing a boolean indicating whether the text has been copied and a function to handle the copy action.
 */
export default function useCopy() {
  const [copied, setCopied] = useState(false);
  // Example NTFY topic

  /**
   * This function handles the copy action by writing the provided text to the clipboard, updating the copied state to true, and resetting it back to false after 2 seconds.
   * @param text - The text to be copied to the clipboard.
   */
  const copyToClipboard = ({ text }: { text: string }) => {

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copyToClipboard };
}