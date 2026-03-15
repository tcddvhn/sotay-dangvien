window.SOTAY_BOOTSTRAP = window.SOTAY_BOOTSTRAP || {};

window.SOTAY_BOOTSTRAP.pdfViewerUrl = window.SOTAY_BOOTSTRAP.pdfViewerUrl || "web/viewer.html";
window.SOTAY_BOOTSTRAP.pdfBasePath = window.SOTAY_BOOTSTRAP.pdfBasePath || "..";
window.SOTAY_BOOTSTRAP.adminUrl = window.SOTAY_BOOTSTRAP.adminUrl || "./admin.html";
window.SOTAY_BOOTSTRAP.adminUsernameDomain = window.SOTAY_BOOTSTRAP.adminUsernameDomain || "sotay.com";
window.SOTAY_BOOTSTRAP.feedbackEndpoint = window.SOTAY_BOOTSTRAP.feedbackEndpoint || "https://script.google.com/macros/s/AKfycby1oXVzH9EeR0v1j2goesabdRwKECaUWLJNuPaeOJNBbsF0p5kAsgc53c-ISqOg491z/exec";
window.SOTAY_BOOTSTRAP.feedbackTransport = window.SOTAY_BOOTSTRAP.feedbackTransport || "legacy-query";

const defaultLiveConfig = {
  enabled: true,
  provider: "firebase-v8-compat",
  collection: "sotay",
  document: "dulieu",
  firebaseConfig: {
    apiKey: "AIzaSyAN6SAuJhlkYtnuqVclEBhMn2Jz565Q7gs",
    authDomain: "sotay-dangvien.firebaseapp.com",
    projectId: "sotay-dangvien",
    storageBucket: "sotay-dangvien.firebasestorage.app",
    messagingSenderId: "699788813951",
    appId: "1:699788813951:web:14eb81183799f83e0f814a"
  }
};

window.SOTAY_BOOTSTRAP.live = Object.assign({}, defaultLiveConfig, window.SOTAY_BOOTSTRAP.live || {});
window.SOTAY_BOOTSTRAP.live.firebaseConfig = Object.assign(
  {},
  defaultLiveConfig.firebaseConfig,
  (window.SOTAY_BOOTSTRAP.live && window.SOTAY_BOOTSTRAP.live.firebaseConfig) || {}
);

window.SOTAY_PDF_COLLECTION = Object.assign({
  hd02: { name: "Hướng dẫn 02", shortName: "HD 02", file: "huongdan.pdf", url: "" },
  qd294: { name: "Quy định 294", shortName: "QĐ 294", file: "quydinh294.pdf", url: "" },
  hd38: { name: "Hướng dẫn 38", shortName: "HD 38", file: "huongdan38.pdf", url: "" },
  hd21: { name: "Hướng dẫn 21", shortName: "HD 21", file: "huongdan21.pdf", url: "" },
  hd06: { name: "Hướng dẫn 06", shortName: "HD 06", file: "huongdan06.pdf", url: "" }
}, window.SOTAY_PDF_COLLECTION || {});

window.SOTAY_DEMO_TREE = [
  {
    id: "rule-root-1",
    title: "Đảng viên và hồ sơ",
    tag: "Quy định",
    summary: "<p>Tập trung vào các tình huống thường gặp như mất thẻ đảng, quản lý hồ sơ và quy trình xác minh.</p>",
    detail: "",
    level: 0,
    children: [
      {
        id: "rule-1",
        title: "Mất thẻ đảng xử lý như thế nào?",
        tag: "Quy định",
        summary: "<p>Trả lời nhanh theo 3 bước: báo cáo, xác minh và đề nghị cấp lại.</p>",
        detail: "<p><strong>Bước 1:</strong> Báo ngay với chi bộ hoặc cấp ủy trực tiếp quản lý.</p><p><strong>Bước 2:</strong> Lập văn bản giải trình, nêu rõ nguyên nhân và thời điểm phát hiện mất.</p><p><strong>Bước 3:</strong> Hoàn thiện hồ sơ đề nghị cấp lại theo biểu mẫu, kèm xác nhận của tổ chức đảng có thẩm quyền.</p>",
        level: 1,
        pdfRefs: [{ doc: "hd02", page: 14 }],
        children: []
      },
      {
        id: "rule-2",
        title: "Có cần lưu bản scan hồ sơ đảng viên không?",
        tag: "Hỏi đáp",
        summary: "<p>Nên lưu bản số hóa có kiểm soát quyền truy cập, song song với bộ hồ sơ giấy theo quy chế lưu trữ nội bộ.</p>",
        detail: "<p>Thực tiễn tốt là lưu bản scan để tra cứu nhanh, nhưng vẫn phải quản lý theo danh mục hồ sơ, phân quyền truy cập và theo đúng thời hạn lưu trữ.</p>",
        level: 1,
        children: []
      }
    ]
  },
  {
    id: "rule-root-2",
    title: "Tổ chức cơ sở đảng",
    tag: "Quy trình",
    summary: "<p>Nhóm nội dung theo hướng tác vụ: họp chi bộ, biểu quyết, biên bản và các thủ tục thường kỳ.</p>",
    detail: "",
    level: 0,
    children: [
      {
        id: "rule-3",
        title: "Đảng viên dự bị có được biểu quyết không?",
        tag: "Hỏi đáp",
        summary: "<p>Câu trả lời nên nêu ngay ở đầu, sau đó mới đến căn cứ và ngoại lệ hay nhầm lẫn.</p>",
        detail: "<p>Trong phần lớn tình huống nghiệp vụ, nội dung cần được trình bày theo thứ tự: kết luận ngắn, căn cứ, ví dụ áp dụng và lưu ý khi ghi biên bản.</p>",
        level: 1,
        pdfRefs: [{ doc: "qd294", page: 21 }],
        children: []
      },
      {
        id: "rule-4",
        title: "Mẫu biên bản sinh hoạt chi bộ",
        tag: "Biểu mẫu",
        summary: "<p>Biểu mẫu chuẩn dùng trong các cuộc họp định kỳ, giúp giảm thiếu sót khi hoàn thiện hồ sơ.</p>",
        detail: "<p>Biểu mẫu nên được dùng cùng checklist thành phần tham dự, nội dung thảo luận và phần biểu quyết để tránh bỏ sót thông tin.</p>",
        level: 1,
        fileUrl: "#",
        fileName: "Mẫu biên bản sinh hoạt chi bộ",
        children: []
      }
    ]
  },
  {
    id: "rule-root-3",
    title: "Biểu mẫu và nghiệp vụ liên thông",
    tag: "Biểu mẫu",
    summary: "<p>Ưu tiên những biểu mẫu mà người dùng cần tải ngay sau khi đọc câu trả lời tóm tắt.</p>",
    detail: "",
    level: 0,
    children: [
      {
        id: "rule-5",
        title: "Mẫu đề nghị cấp lại thẻ đảng",
        tag: "Biểu mẫu",
        summary: "<p>Dùng khi mất, hỏng hoặc cần cập nhật thông tin liên quan đến thẻ đảng.</p>",
        detail: "<p>Nên đi kèm hướng dẫn thành phần hồ sơ, nơi tiếp nhận và thời gian xử lý dự kiến.</p>",
        level: 1,
        fileUrl: "#",
        fileName: "Mẫu đề nghị cấp lại thẻ đảng",
        pdfRefs: [{ doc: "hd21", page: 9 }],
        children: []
      }
    ]
  }
];

window.SOTAY_BOOTSTRAP.treeData = window.SOTAY_BOOTSTRAP.treeData || window.SOTAY_DEMO_TREE;
