import { readFileSync } from "node:fs"

export function getVersion() {
  if (process.env.NODE_ENV === 'development') {
    return JSON.parse(readFileSync('package.json', 'utf-8')).version
  } else {
    return process.env['CSM_VERSION'] + ` ${ process.env['DISABLE_ANALYTICS'] ? "(Analytics Disabled)" : "" }`
  }
}

export function getEnvironment() {
  if (process.env.USING_NPX === 'true') {
    
  }
}