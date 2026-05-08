import chalk from 'chalk';
import open from 'open';

export function openFeedbackLink() {
  open('https://87dc93gvoy0.typeform.com/to/d1RgWfZX');
}

export function logFeedbackNudge() {
  console.log(`Have any feedback for the ${chalk.blue('Conte')}${chalk.yellow('ntful')}${chalk.red(
    ' CLI'
  )}? We'd love to hear from you! Check out our five question developer experience survey at:
  ${chalk.underline('https://87dc93gvoy0.typeform.com/to/d1RgWfZX')}
  `);
}
