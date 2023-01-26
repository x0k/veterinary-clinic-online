import { fetchJSONP } from '@/lib/jsonp'

export const VK_API_ROOT = 'https://api.vk.com/method'

export const VK_API_VERSION = encodeURIComponent('5.131')

export interface VKUserContacts {
  mobile_phone: string
  home_phone: string
}

export interface VKUser {
  id: number
  first_name: string
  last_name: string
  deactivated?: 'deleted' | 'banned'
  is_closed: boolean
  can_access_closed: boolean
  has_mobile: boolean
  contacts?: VKUserContacts
  home_phone?: string
}

export interface VKResponse<T> {
  response: T
}

export async function getUserInfo(accessToken: string): Promise<VKUser> {
  const data = await fetchJSONP<VKResponse<VKUser[]>>(
    `${VK_API_ROOT}/users.get?fields=contacts,has_mobile&v=${VK_API_VERSION}&access_token=${accessToken}`
  )
  return data.response[0]
}

export interface VKProfileInfo {
  first_name: string

  last_name: string

  maiden_name?: string

  screen_name?: string

  // 1 — женский,
  // 2 — мужской,
  // 0 — пол не указан.
  sex: 1 | 2 | 0

  // Семейное положение. Возможные значения:
  // 1 — не женат/не замужем,
  // 2 — есть друг/есть подруга,
  // 3 — помолвлен/помолвлена,
  // 4 — женат/замужем,
  // 5 — всё сложно,
  // 6 — в активном поиске,
  // 7 — влюблён/влюблена,
  // 8 — в гражданском браке,
  // 0 — не указано.
  relation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 0

  // Объект пользователя, с которым связано семейное положение (если есть).
  relation_partner?: VKUser

  relation_pending?: 1

  relation_requests?: VKUser[]

  // Дата рождения пользователя, возвращается в формате D.M.YYYY.
  bdate: string

  // 1 — показывать дату рождения,
  // 2 — показывать только месяц и день,
  // 0 — не показывать дату рождения.
  bdate_visibility: 1 | 2 | 0

  home_town: string
  country: {
    id: number

    title: string
  }
  city: {
    id: number

    title: string
  }

  // Информация о заявке на смену имени, если она была подана. Объект, содержащий поля:
  name_request: {
    id: number

    // processing – заявка рассматривается,
    // declined – заявка отклонена,
    // response – общий ответ по статусу обработки заявки,
    // response_with_link – общий ответ по статусу обработки заявки, содержащий ссылку в поле link.
    status: 'processing' | 'declined' | 'response' | 'response_with_link'

    first_name: string

    last_name: string
  }

  status: string

  phone: string
}

export async function getProfileInfo(
  accessToken: string
): Promise<VKProfileInfo> {
  const data = await fetchJSONP<VKResponse<VKProfileInfo>>(
    `${VK_API_ROOT}/account.getProfileInfo?v=${VK_API_VERSION}&access_token=${accessToken}`
  )
  return data.response
}
