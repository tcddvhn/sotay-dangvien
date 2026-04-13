importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAN6SAuJhlkYtnuqVclEBhMn2Jz565Q7gs",
  authDomain: "sotay-dangvien.firebaseapp.com",
  projectId: "sotay-dangvien",
  storageBucket: "sotay-dangvien.firebasestorage.app",
  messagingSenderId: "699788813951",
  appId: "1:699788813951:web:14eb81183799f83e0f814a"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const title = (payload.notification && payload.notification.title) || 'Thông báo mới';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/favicon.ico'
  };
  return self.registration.showNotification(title, options);
});
