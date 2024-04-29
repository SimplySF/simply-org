/*
 * Copyright (c) 2024, Clay Chipps; Copyright (c) 2024, Salesforce.com, Inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';

describe('simply package dependencies install', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();

  before(async () => {
    await $$.stubAuths(testOrg);
  });

  afterEach(() => {
    $$.restore();
  });
});
