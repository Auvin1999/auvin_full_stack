import { useUserStore } from '@/store/useUserStore'

/**
 * 字符权限校验
 */
export function checkPermi(value: string[]): boolean {
  if (value && Array.isArray(value) && value.length > 0) {
    const permissions = useUserStore.getState().permissions
    const allPermission = '*:*:*'
    const hasPermission = permissions.some((permission) => {
      return allPermission === permission || value.includes(permission)
    })
    return hasPermission
  } else {
    console.error(`need roles! Like checkPermi="['system:user:add','system:user:edit']"`)
    return false
  }
}

/**
 * 角色权限校验
 */
export function checkRole(value: string[]): boolean {
  if (value && Array.isArray(value) && value.length > 0) {
    const roles = useUserStore.getState().roles
    const superAdmin = 'admin'
    const hasRole = roles.some((role) => {
      return superAdmin === role || value.includes(role)
    })
    return hasRole
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`)
    return false
  }
}
