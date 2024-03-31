// eslint-disable-next-line import/no-anonymous-default-export
import { metadata } from './layout'

declare let self: ServiceWorkerGlobalScope & {
  Notification?: typeof Notification;
}

self.addEventListener("push", (event) => {
  if (!(self.Notification && self.Notification.permission === "granted")) {
    return;
  }
  const data = event.data?.json() ?? {};
  let title = "Ветеринарная клиника";
  if ("title" in data && typeof data.title === "string") {
    title = data.title;
  } else if (typeof metadata.title === "string") {
    title = metadata.title;
  }
	event.waitUntil(
		self.registration.showNotification(title, {
      icon: "/apple-touch-icon.png",
			body: data.message || "Что-то произошло, проверьте приложение",
		})
	);
});
