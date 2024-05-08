import { openFeedbackLink } from './feedback';

const nonInteractive = async () => {
  openFeedbackLink();
};
const interactive = async () => {
  // No difference between interactive and non-interactive mode for opening feedback link
  nonInteractive()
}

export const feedback = {
  nonInteractive,
  interactive
};
