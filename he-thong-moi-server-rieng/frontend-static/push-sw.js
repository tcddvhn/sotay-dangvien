self.addEventListener('push', (event) => {
    const data = (() => {
        try {
            return event.data ? event.data.json() : {};
        } catch {
            return {
                title: 'Thong bao moi',
                body: event.data ? event.data.text() : 'He thong co thong bao moi.',
                url: '/'
            };
        }
    })();

    const title = data.title || 'Thong bao moi';
    const options = {
        body: data.body || 'He thong co thong bao moi.',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }

            return undefined;
        })
    );
});
