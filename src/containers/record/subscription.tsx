import { useEffect, useState } from 'react'

const isServiceWorkerSupported =
  globalThis.navigator && 'serviceWorker' in navigator

async function getSubscriptionStatus(): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported || Notification.permission !== 'granted') {
    return null
  }
  const reg = await navigator.serviceWorker.ready
  return await reg.pushManager.getSubscription()
}

async function unsubscribe(): Promise<void> {
  const sub = await getSubscriptionStatus()
  await sub?.unsubscribe()
}

async function saveSubscription(sub: PushSubscription): Promise<void> {
  try {
    const res = await fetch('/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sub.toJSON()),
    })
    if (!res.ok) {
      throw new Error(await res.text())
    }
  } catch (e) {
    console.error(e)
    await unsubscribe()
  }
}

async function subscribe(): Promise<void> {
  if (!isServiceWorkerSupported) {
    return
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return
  }
  try {
    const res = await fetch('/api/vapidPublicKey')
    const publicKey = await res.text()
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    })
    await saveSubscription(sub)
  } catch (e) {
    console.error(e)
  }
}

async function removeSubscription(): Promise<void> {
  const sub = await getSubscriptionStatus()
  if (sub === null) {
    return
  }
  try {
    const res = await fetch('/api/subscription', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sub.toJSON()),
    })
    if (!res.ok) {
      throw new Error(await res.text())
    }
    await unsubscribe()
  } catch (e) {
    console.error(e)
  }
}

export function Subscription(): JSX.Element | null {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  useEffect(() => {
    void getSubscriptionStatus().then(setSubscription)
  }, [])
  if (!isServiceWorkerSupported) {
    return (
      <p className="text-base-content/60">
        Ваш браузер не поддерживает Push уведомления
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      {subscription ? (
        <>
          <p>Вы подписаны на обновления вашей записи</p>
          <button className="btn btn-ghost" onClick={removeSubscription}>
            Отписаться от уведомлений
          </button>
        </>
      ) : (
        <>
          <p>Что бы оперативно получать обновления вашей записи, вы можете</p>
          <button className="btn btn-primary max-w-fit" onClick={subscribe}>
            Подписаться на уведомления
          </button>
        </>
      )}
    </div>
  )
}
