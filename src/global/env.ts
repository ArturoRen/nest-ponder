import cluster from 'node:cluster'

/**
 * 是否主实例
 */
export const isMainCluster
  = process.env.NODE_APP_INSTANCE && Number.parseInt(process.env.NODE_APP_INSTANCE) === 0

/**
 * 是否主进程
 */
export const isMainProcess = cluster.isPrimary || isMainCluster

/**
 * 是否开发环境
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * 是否测试环境
 */
export const isTest = !!process.env.TEST

/**
 * 基础类型接口
 */
export type BaseType = boolean | number | string | undefined | null

/**
 * 当前工作目录
 */
export const cwd = process.cwd()

/**
 * 根据环境变量格式化值。
 *
 * @param key 环境变量的名称。
 * @param defaultValue 当环境变量不存在时使用的默认值。
 * @param callback 一个可选的回调函数，用于进一步处理环境变量的值。
 * @returns 返回格式化后的值，其类型与泛型T一致。
 */
function formatValue<T extends BaseType = string>(key: string, defaultValue: T, callback?: (value: string) => T): T {
  // 尝试从环境变量中获取值
  const value: string | undefined = process.env[key]
  // 如果环境变量不存在，返回默认值
  if (typeof value === 'undefined')
    return defaultValue

  // 如果没有提供回调函数，直接返回环境变量的值（类型断言为泛型T）
  if (!callback)
    return value as unknown as T

  // 如果提供了回调函数，使用它来格式化环境变量的值，并返回
  return callback(value)
}

/**
 * 根据环境变量获取字符串值。
 *
 * @param key 环境变量的名称。
 * @param defaultValue 当环境变量不存在时，返回的默认值。默认为空字符串。
 * @returns 环境变量的字符串值，或者默认值。
 */
export function envString(key: string, defaultValue = '') {
  return formatValue(key, defaultValue)
}

/**
 * 根据环境变量的值返回一个数字。
 *
 * @param key 环境变量的名称。
 * @param defaultValue 当环境变量不存在或无法转换为数字时的默认值，默认为0。
 * @returns 返回环境变量的数字值或默认值，如果转换失败则抛出错误。
 */
export function envNumber(key: string, defaultValue = 0) {
  return formatValue(key, defaultValue, (value) => {
    try {
      return Number(value)
    }
    catch {
      throw new Error(`${key} environment variable is not a number`)
    }
  })
}

/**
 * 根据环境变量的值解析为布尔类型。
 *
 * @param key 环境变量的键名。
 * @param defaultValue 当环境变量不存在或无法解析为布尔值时的默认值，默认为false。
 * @returns 解析后的布尔值。
 * @throws 如果环境变量的值不是有效的布尔表示，则抛出错误。
 */
export function envBoolean(key: string, defaultValue = false) {
  return formatValue(key, defaultValue, (value) => {
    try {
      return Boolean(JSON.parse(value))
    }
    catch {
      throw new Error(`${key} environment variable is not a boolean`)
    }
  })
}

/**
 * 根据环境变量名称获取值。
 *
 * @param key 环境变量的名称。
 * @param defaultValue 当环境变量不存在时，返回的默认值。默认为空字符串。
 * @returns 环境变量的值或默认值。
 */
export function env(key: string, defaultValue = '') {
  // 通过formatValue函数处理并返回环境变量的值或默认值
  return formatValue(key, defaultValue)
}
