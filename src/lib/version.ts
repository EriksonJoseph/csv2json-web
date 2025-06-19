import _package from '../../package.json'

export function getAppVersion(): string {
  return _package.version
}
