/*
 * Copyright (c) 2024, Clay Chipps; Copyright (c) 2024, Salesforce.com, Inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { Limit, LimitResult } from './limitTypes.js';

export const canCreateScratchOrg = async (connection: Connection): Promise<boolean> => {
  const limits = await getApiLimits(connection);

  const activeScratchOrgs = limits.find((limit) => limit.name === 'ActiveScratchOrgs');
  const dailyScratchOrgs = limits.find((limit) => limit.name === 'DailyScratchOrgs');

  const activeRemaining = activeScratchOrgs?.remaining ?? 0;
  const dailyRemaining = dailyScratchOrgs?.remaining ?? 0;

  return activeRemaining > 0 && dailyRemaining > 0;
};

export const getApiLimits = async (connection: Connection): Promise<Limit[]> => {
  const result = await connection.request<LimitResult>('/limits');

  const limits: Limit[] = Object.entries(result).map(([name, { Max, Remaining }]) => ({
    name,
    max: Max,
    remaining: Remaining,
  }));

  return limits;
};
