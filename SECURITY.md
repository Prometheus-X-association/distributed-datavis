# Security policy

## Supported versions

Security fixes are released for the latest minor version of the Distributed
Data Visualization (DDV) building block.

| Version | Supported |
| --- | --- |
| 0.5.x | Yes |
| < 0.5 | No |

## Reporting a vulnerability

Please do not report security vulnerabilities in public GitHub issues,
discussions or pull requests.

Report them privately through GitHub private vulnerability reporting:
https://github.com/Prometheus-X-association/distributed-datavis/security/advisories/new

Please include:

- the affected version or commit
- a description of the issue and its possible impact
- steps to reproduce, or a proof of concept
- any suggested fix, if you have one


## Scope

In scope:

- the DDV library source in this repository
- the built library (`ptx-ddv.js`) published in GitHub Releases
- the container image and Docker configuration in this repository

Out of scope:

- applications that embed DDV, and the data sources they connect it to
- vulnerabilities in third-party libraries: please report them to the
  library's maintainers, and tell us if they affect DDV

## Dependency monitoring

Dependencies are monitored with GitHub Dependabot. Vulnerable dependencies
are updated in patch releases.

## Notes for integrators

DDV runs in the end user's browser and fetches data only from the URLs given
in its configuration. Only pass configuration and data URLs from sources you
trust.