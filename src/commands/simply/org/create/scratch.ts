/*
 * Copyright (c) 2024, Clay Chipps; Copyright (c) 2024, Salesforce.com, Inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import {
  AuthInfo,
  Connection,
  Lifecycle,
  Messages,
  Org,
  scratchOrgCreate,
  ScratchOrgCreateOptions,
  ScratchOrgLifecycleEvent,
  scratchOrgLifecycleEventName,
  SfError,
} from '@salesforce/core';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Duration } from '@salesforce/kit';

import { canCreateScratchOrg } from '../../../../common/orgUtils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@simplysf/simply-package', 'simply.org.create.scratch');

export const secretTimeout = 60_000;

const definitionFileHelpGroupName = 'Definition File Override';

export default class OrgCreateScratch extends SfCommand<ScratchCreateResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'admin-email': Flags.string({
      summary: messages.getMessage('flags.admin-email.summary'),
      helpGroup: definitionFileHelpGroupName,
    }),
    alias: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.alias.summary'),
      description: messages.getMessage('flags.alias.description'),
    }),
    'api-version': Flags.orgApiVersion(),
    async: Flags.boolean({
      summary: messages.getMessage('flags.async.summary'),
      description: messages.getMessage('flags.async.description'),
    }),
    'client-id': Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.client-id.summary'),
    }),
    'definition-file': Flags.file({
      exists: true,
      char: 'f',
      summary: messages.getMessage('flags.definition-file.summary'),
      description: messages.getMessage('flags.definition-file.description'),
    }),
    description: Flags.string({
      summary: messages.getMessage('flags.description.summary'),
      helpGroup: definitionFileHelpGroupName,
    }),
    'duration-days': Flags.duration({
      unit: 'days',
      default: Duration.days(7),
      min: 1,
      max: 30,
      char: 'y',
      helpValue: '<days>',
      summary: messages.getMessage('flags.duration-days.summary'),
    }),
    edition: Flags.string({
      char: 'e',
      summary: messages.getMessage('flags.edition.summary'),
      description: messages.getMessage('flags.edition.description'),
      options: [
        'developer',
        'enterprise',
        'group',
        'professional',
        'partner-developer',
        'partner-enterprise',
        'partner-group',
        'partner-professional',
      ],
      // eslint-disable-next-line @typescript-eslint/require-await
      parse: async (value: string) => {
        // the API expects partner editions in `partner <EDITION>` format.
        // so we replace the hyphen here with a space.
        if (value.startsWith('partner-')) {
          return value.replace('-', ' ');
        }
        return value;
      },
      helpGroup: definitionFileHelpGroupName,
    }),
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      helpGroup: definitionFileHelpGroupName,
    }),
    'no-ancestors': Flags.boolean({
      char: 'c',
      summary: messages.getMessage('flags.no-ancestors.summary'),
      helpGroup: 'Packaging',
    }),
    'no-namespace': Flags.boolean({
      char: 'm',
      summary: messages.getMessage('flags.no-namespace.summary'),
      helpGroup: 'Packaging',
    }),
    release: Flags.string({
      summary: messages.getMessage('flags.release.summary'),
      description: messages.getMessage('flags.release.description'),
      options: ['preview', 'previous'],
      helpGroup: definitionFileHelpGroupName,
    }),
    'set-default': Flags.boolean({
      char: 'd',
      summary: messages.getMessage('flags.set-default.summary'),
    }),
    'source-org': Flags.salesforceId({
      summary: messages.getMessage('flags.source-org.summary'),
      startsWith: '00D',
      length: 15,
      helpGroup: definitionFileHelpGroupName,
      // salesforceId flag has `i` and that would be a conflict with client-id
      char: undefined,
    }),
    'target-dev-hub': Flags.string({
      char: 'v',
      summary: messages.getMessage('flags.target-dev-hub.summary'),
      description: messages.getMessage('flags.target-dev-hub.description'),
      multiple: true,
      required: true,
    }),
    'track-source': Flags.boolean({
      default: true,
      char: 't',
      summary: messages.getMessage('flags.track-source.summary'),
      description: messages.getMessage('flags.track-source.description'),
      allowNo: true,
    }),
    username: Flags.string({
      summary: messages.getMessage('flags.username.summary'),
      description: messages.getMessage('flags.username.description'),
      helpGroup: definitionFileHelpGroupName,
    }),
    wait: Flags.duration({
      unit: 'minutes',
      default: Duration.minutes(5),
      min: 2,
      char: 'w',
      helpValue: '<minutes>',
      summary: messages.getMessage('flags.wait.summary'),
      description: messages.getMessage('flags.wait.description'),
    }),
  };

  public async run(): Promise<ScratchCreateResponse> {
    const { flags } = await this.parse(OrgCreateScratch);

    let targetDevHubOrg;

    for (const targetDevHub of flags['target-dev-hub'] ?? []) {
      // Initialize the authorization for the provided dev hub
      const targetDevHubAuthInfo = await AuthInfo.create({ username: targetDevHub });
      // Create a connection to the dev hub
      const targetDevHubConnection = await Connection.create({ authInfo: targetDevHubAuthInfo });

      // Determine if the dev hub is available
      if (await canCreateScratchOrg(targetDevHubConnection)) {
        targetDevHubOrg = await Org.create({ connection: targetDevHubConnection });
        break;
      }
    }

    if (!targetDevHubOrg) {
      throw messages.createError('noAvailableDevhubs');
    }

    const baseUrl = targetDevHubOrg.getField(Org.Fields.INSTANCE_URL)?.toString();
    if (!baseUrl) {
      throw new SfError('No instance URL found for the dev hub');
    }

    const scratchOrgCreateOptions: ScratchOrgCreateOptions = {
      alias: flags.alias,
      apiversion: flags['api-version'],
      clientSecret: flags['client-id']
        ? await this.secretPrompt({ message: messages.getMessage('prompt.secret') })
        : undefined,
      connectedAppConsumerKey: flags['client-id'],
      durationDays: flags['duration-days'].days,
      hubOrg: targetDevHubOrg,
      nonamespace: flags['no-namespace'],
      noancestors: flags['no-ancestors'],
      orgConfig: {
        ...(flags['definition-file']
          ? (JSON.parse(await fs.promises.readFile(flags['definition-file'], 'utf-8')) as Record<string, unknown>)
          : {}),
        ...(flags.edition ? { edition: flags.edition } : {}),
        ...(flags.username ? { username: flags.username } : {}),
        ...(flags.description ? { description: flags.description } : {}),
        ...(flags.name ? { orgName: flags.name } : {}),
        ...(flags.release ? { release: flags.release } : {}),
        ...(flags['source-org'] ? { sourceOrg: flags['source-org'] } : {}),
        ...(flags['admin-email'] ? { adminEmail: flags['admin-email'] } : {}),
      },
      setDefault: flags['set-default'],
      tracksSource: flags['track-source'],
      wait: flags.async ? Duration.minutes(0) : flags.wait,
    };

    let lastStatus: string | undefined;

    if (!flags.async) {
      Lifecycle.getInstance().on<ScratchOrgLifecycleEvent>(
        scratchOrgLifecycleEventName,
        async (data): Promise<void> => {
          lastStatus = buildStatus(data, baseUrl);
          this.spinner.status = lastStatus;
          return Promise.resolve();
        }
      );
    }
    this.log();
    this.spinner.start(
      flags.async ? 'Requesting Scratch Org (will not wait for completion because --async)' : 'Creating Scratch Org'
    );

    try {
      const { username, scratchOrgInfo, authFields, warnings } = await scratchOrgCreate(scratchOrgCreateOptions);

      this.spinner.stop(lastStatus);
      if (!scratchOrgInfo) {
        throw new SfError('The scratch org did not return with any information');
      }
      this.log();
      if (flags.async) {
        this.info(messages.getMessage('action.resume', [this.config.bin, scratchOrgInfo.Id]));
      } else {
        this.logSuccess(messages.getMessage('success'));
      }

      return { username, scratchOrgInfo, authFields, warnings, orgId: authFields?.orgId };
    } catch (error) {
      if (error instanceof SfError && error.name === 'ScratchOrgInfoTimeoutError') {
        this.spinner.stop(lastStatus);
        const scratchOrgInfoId = (error.data as { scratchOrgInfoId: string }).scratchOrgInfoId;
        const resumeMessage = messages.getMessage('action.resume', [this.config.bin, scratchOrgInfoId]);

        this.info(resumeMessage);
        this.error('The scratch org did not complete within your wait time', { code: '69', exit: 69 });
      } else {
        throw error;
      }
    }
  }
}
