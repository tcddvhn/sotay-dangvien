(function initSotayLiveData() {
  const bootstrap = window.SOTAY_BOOTSTRAP || {};
  const live = bootstrap.live || {};

  if (!live.enabled) return;
  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    window.dispatchEvent(new CustomEvent("sotay-v3:live-error", {
      detail: { reason: "firebase_unavailable" }
    }));
    return;
  }

  try {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(live.firebaseConfig || {});
    }

    const db = window.firebase.firestore();
    const collectionName = live.collection || "sotay";
    const documentName = live.document || "dulieu";
    let hasSyncedOnce = false;

    db.collection(collectionName).doc(documentName).onSnapshot((doc) => {
      const treeData = doc.exists && doc.data() ? (doc.data().treeData || []) : [];
      bootstrap.treeData = Array.isArray(treeData) ? treeData : [];

      const eventDetail = {
        treeData: bootstrap.treeData,
        source: "firestore",
        announce: !hasSyncedOnce,
        message: !hasSyncedOnce ? "Đã nạp dữ liệu live từ Firestore." : "Nội dung vừa được cập nhật từ hệ thống."
      };

      if (window.SotayV3App && typeof window.SotayV3App.setTreeData === "function") {
        window.SotayV3App.setTreeData(eventDetail.treeData, eventDetail);
      } else {
        window.dispatchEvent(new CustomEvent("sotay-v3:data-updated", { detail: eventDetail }));
      }

      hasSyncedOnce = true;
    }, () => {
      window.dispatchEvent(new CustomEvent("sotay-v3:live-error", {
        detail: { reason: "firestore_snapshot_failed" }
      }));
    });
  } catch (error) {
    window.dispatchEvent(new CustomEvent("sotay-v3:live-error", {
      detail: { reason: "firebase_init_failed", error }
    }));
  }
})();
