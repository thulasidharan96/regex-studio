/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { emailTemplate } from './email';
import { phoneTemplate } from './phone';
import { urlTemplate } from './url';
import { uuidTemplate } from './uuid';
import { jwtTemplate } from './jwt';
import { ipv4Template, ipv6Template } from './ip';
import { passwordTemplate } from './password';
import { dateTemplate, timeTemplate } from './date';

export const templatesRegistry = [
  emailTemplate,
  phoneTemplate,
  urlTemplate,
  uuidTemplate,
  jwtTemplate,
  ipv4Template,
  ipv6Template,
  passwordTemplate,
  dateTemplate,
  timeTemplate
];

export {
  emailTemplate,
  phoneTemplate,
  urlTemplate,
  uuidTemplate,
  jwtTemplate,
  ipv4Template,
  ipv6Template,
  passwordTemplate,
  dateTemplate,
  timeTemplate
};
