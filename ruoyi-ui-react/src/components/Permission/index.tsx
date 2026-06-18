import { type ReactNode } from 'react'
import { checkPermi, checkRole } from '@/utils/permission'

interface HasPermiProps {
  permissions: string[]
  children: ReactNode
}

/** 权限控制组件，替代 Vue 的 v-hasPermi 指令 */
export function HasPermi({ permissions, children }: HasPermiProps) {
  if (checkPermi(permissions)) {
    return <>{children}</>
  }
  return null
}

interface HasRoleProps {
  roles: string[]
  children: ReactNode
}

/** 角色控制组件 */
export function HasRole({ roles, children }: HasRoleProps) {
  if (checkRole(roles)) {
    return <>{children}</>
  }
  return null
}
