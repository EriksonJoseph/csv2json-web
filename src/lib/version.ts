import packageLock from '../../package-lock.json'

export function getAppVersion(): string {
  return packageLock.version
}
