# @simplysf/simply-org

[![NPM](https://img.shields.io/npm/v/@simplysf/simply-org.svg?label=@simplysf/simply-org)](https://www.npmjs.com/org/@simplysf/simply-org) [![Downloads/week](https://img.shields.io/npm/dw/@simplysf/simply-org.svg)](https://npmjs.org/org/@simplysf/simply-org) [![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD_3--Clause-yellow.svg)](https://raw.githubusercontent.com/SimplySF/simply-org/main/LICENSE.txt)

## Install

```bash
sf plugins install @simplysf/simply-org
```

## Issues

Please report any issues at https://github.com/SimplySF/simply-org/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:SimplySF/simply-org

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev.cmd simply org
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

## Commands

<!-- commands -->
- [@simplysf/simply-org](#simplysfsimply-org)
  - [Install](#install)
  - [Issues](#issues)
  - [Contributing](#contributing)
    - [Build](#build)
  - [Commands](#commands)
  - [`sf simply org dependencies install`](#sf-simply-org-dependencies-install)
  - [`sf simply org version cleanup`](#sf-simply-org-version-cleanup)

## `sf simply org dependencies install`

Install org dependencies for a Salesforce project.

```
USAGE
  $ sf simply org dependencies install -o <value> [--json] [--flags-dir <value>] [-a all|org] [--api-version <value>] [-z
    <value>] [-i All|Delta] [-k <value>] [-r] [-b <value>] [-s AllUsers|AdminsOnly] [-v <value>] [-t
    DeprecateOnly|Mixed|Delete] [-w <value>]

FLAGS
  -a, --apex-compile=<option>        Compile all Apex in the org and org, or only Apex in the org; unlocked
                                     orgs only.
                                     <options: all|org>
  -b, --publish-wait=<value>         Maximum number of minutes to wait for the Subscriber org Version ID to become
                                     available in the target org before canceling the install request.
  -i, --install-type=<option>        [default: Delta] Install all orgs or only deltas.
                                     <options: All|Delta>
  -k, --installation-key=<value>...  Installation key for key-protected orgs
  -o, --target-org=<value>           (required) Username or alias of the target org. Not required if the `target-org`
                                     configuration variable is already set.
  -r, --no-prompt                    Don't prompt for confirmation.
  -s, --security-type=<option>       [default: AdminsOnly] Security access type for the installed org. (deprecation
                                     notice: The default --security-type value will change from AllUsers to AdminsOnly
                                     in v47.0 or later.)
                                     <options: AllUsers|AdminsOnly>
  -t, --upgrade-type=<option>        [default: Mixed] Upgrade type for the org installation; available only for
                                     unlocked orgs.
                                     <options: DeprecateOnly|Mixed|Delete>
  -v, --target-dev-hub=<value>       Username or alias of the Dev Hub org.
  -w, --wait=<value>                 Number of minutes to wait for installation status.
  -z, --branch=<value>               org branch to consider when specifiying a org/VersionNumber combination
      --api-version=<value>          Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Install org dependencies for a Salesforce project.

  Installs all specified org dependencies in a Salesforce DX project using the sfdx-project.json definition.

EXAMPLES
  $ sf simply org dependencies install --target-org myTargetOrg --target-dev-hub myTargetDevHub

  $ sf simply org dependencies install --target-org myTargetOrg --target-dev-hub myTargetDevHub --installation-key "Myorg1Alias:Myorg1Key"

  $ sf simply org dependencies install --target-org myTargetOrg --target-dev-hub myTargetDevHub --installation-key "Myorg1Alias:Myorg1Key" --installation-key "Myorg2Alias:Myorg2Key"

FLAG DESCRIPTIONS
  -a, --apex-compile=all|org

    Compile all Apex in the org and org, or only Apex in the org; unlocked orgs only.

    Applies to unlocked orgs only. Specifies whether to compile all Apex in the org and org, or only the Apex in
    the org.

    For org installs into production orgs, or any org that has Apex Compile on Deploy enabled, the platform compiles
    all Apex in the org after the org install or upgrade operation completes.

    This approach assures that org installs and upgrades don’t impact the performance of an org, and is done even if
    --apex-compile org is specified.

  -i, --install-type=All|Delta  Install all orgs or only deltas.

    If 'All' is specified, then all orgs specified in org dependencies are installed, regardless of if the
    version already is installed in the org. If 'Delta' is specified, then only orgs that differ from what is
    installed in the org will be installed.

  -k, --installation-key=<value>...  Installation key for key-protected orgs

    Installation key for key-protected orgs in the key:value format of SubscriberorgVersionId:Key

  -r, --no-prompt  Don't prompt for confirmation.

    Allows the following without an explicit confirmation response: 1) Remote Site Settings and Content Security Policy
    websites to send or receive data, and 2) --upgrade-type Delete to proceed.

  -t, --upgrade-type=DeprecateOnly|Mixed|Delete

    Upgrade type for the org installation; available only for unlocked orgs.

    For org upgrades, specifies whether to mark all removed components as deprecated (DeprecateOnly), to delete
    removed components that can be safely deleted and deprecate the others (Mixed), or to delete all removed components,
    except for custom objects and custom fields, that don't have dependencies (Delete). The default is Mixed. Can
    specify DeprecateOnly or Delete only for unlocked org upgrades.

  -z, --branch=<value>  org branch to consider when specifiying a org/VersionNumber combination

    For dependencies specified by org/VersionNumber combination, you can specify the branch group of builds to work
    from by entering the branch build name. If not specified, the builds from NULL branch will be considered.
```

_See code: [src/commands/simply/org/dependencies/install.ts](https://github.com/SimplySF/simply-org/blob/1.2.5/src/commands/simply/org/dependencies/install.ts)_

## `sf simply org version cleanup`

Cleanup org versions.

```
USAGE
  $ sf simply org version cleanup -s <value> -p <value> -v <value> [--json] [--flags-dir <value>] [--api-version
  <value>]

FLAGS
  -p, --org=<value>         (required) org Id
  -s, --matcher=<value>         (required) MAJOR.MINOR.PATCH
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Cleanup org versions.

  Delete org versions for a given org provided a MAJOR.MINOR.PATCH matcher. Does not delete released pacakge
  versions.

EXAMPLES
  $ sf simply org version cleanup --org 0Hoxx00000000CqCAI --matcher 2.10.0 --target-dev-hub myDevHub

FLAG DESCRIPTIONS
  -p, --org=<value>  org Id

    The 0Ht org Id that you wish to cleanup versions for.

  -s, --matcher=<value>  MAJOR.MINOR.PATCH

    The MAJOR.MINOR.PATCH matcher that should be used to find org versions to delete.
```

_See code: [src/commands/simply/org/version/cleanup.ts](https://github.com/SimplySF/simply-org/blob/1.2.5/src/commands/simply/org/version/cleanup.ts)_
<!-- commandsstop -->
