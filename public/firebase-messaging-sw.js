importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCPs1NqOiDCfuAhM3Xt8dQLOs2G5P8jW-8",
  authDomain: "tawer-digital-group.firebaseapp.com",
  projectId: "tawer-digital-group",
  storageBucket: "tawer-digital-group.firebasestorage.app",
  messagingSenderId: "192674173616",
  appId: "1:192674173616:web:88355bbee54b4ed605a175",
  measurementId: "G-25EKW89YZ0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    icon: "/logo.png", // small icon
    image: "/logo.png", // large banner image
    body: payload.notification.body
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.url || "/"; // fallback to homepage

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(clickAction);
    })
  );
});
