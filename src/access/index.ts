import type { Access, FieldAccess } from 'payload'

type MaybeUser = { id?: number | string; role?: string | null } | null | undefined

export const userIsAdmin = (user: MaybeUser): boolean => user?.role === 'admin'

export const isAdmin: Access = ({ req: { user } }) => userIsAdmin(user)

export const isAdminField: FieldAccess = ({ req: { user } }) => userIsAdmin(user)

export const anyone: Access = () => true

export const nobody: Access = () => false

/** 管理员看全部，前台只能看到已上架的内容 */
export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (userIsAdmin(user)) return true
  return { status: { equals: 'published' } }
}
