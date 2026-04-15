(async () => {
    if (!window.firebase || !firebase.apps || !firebase.apps.length) {
        throw new Error('Firebase chua duoc khoi tao tren trang nay.');
    }

    const db = firebase.firestore();
    const [contentDoc, directoryDoc] = await Promise.all([
        db.collection('sotay').doc('dulieu').get(),
        db.collection('sotay').doc('danhba').get()
    ]);

    const files = [
        {
            fileName: 'content-tree.export.json',
            payload: {
                exportedAt: new Date().toISOString(),
                source: 'sotay/dulieu',
                treeData: contentDoc.exists ? (contentDoc.data().treeData || []) : []
            }
        },
        {
            fileName: 'directory-tree.export.json',
            payload: {
                exportedAt: new Date().toISOString(),
                source: 'sotay/danhba',
                treeData: directoryDoc.exists ? (directoryDoc.data().treeData || []) : []
            }
        }
    ];

    files.forEach(({ fileName, payload }) => {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    });

    console.log('Da tai xong 2 file export Firestore.');
})();
