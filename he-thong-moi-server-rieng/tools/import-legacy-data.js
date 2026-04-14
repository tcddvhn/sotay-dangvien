const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE_URL = 'http://localhost:5243/api';
const DEFAULT_DIRECTORY_SEED = path.join(ROOT_DIR, 'directory-seed.js');
const DEFAULT_CONTENT_EXPORT = path.resolve(__dirname, '..', 'migration-data', 'content-tree.export.json');
const DEFAULT_DIRECTORY_EXPORT = path.resolve(__dirname, '..', 'migration-data', 'directory-tree.export.json');

function parseArgs(argv) {
    const options = {
        baseUrl: DEFAULT_BASE_URL,
        updatedBy: 'migration-tool',
        contentSource: DEFAULT_CONTENT_EXPORT,
        directorySource: fs.existsSync(DEFAULT_DIRECTORY_EXPORT) ? DEFAULT_DIRECTORY_EXPORT : DEFAULT_DIRECTORY_SEED,
        skipContent: false,
        skipDirectory: false
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        switch (arg) {
        case '--base-url':
            options.baseUrl = argv[++index] || options.baseUrl;
            break;
        case '--updated-by':
            options.updatedBy = argv[++index] || options.updatedBy;
            break;
        case '--content':
            options.contentSource = argv[++index] || options.contentSource;
            break;
        case '--directory':
            options.directorySource = argv[++index] || options.directorySource;
            break;
        case '--skip-content':
            options.skipContent = true;
            break;
        case '--skip-directory':
            options.skipDirectory = true;
            break;
        case '--help':
            printHelp();
            process.exit(0);
            break;
        default:
            if (arg) {
                throw new Error(`Tham so khong hop le: ${arg}`);
            }
            break;
        }
    }

    return options;
}

function printHelp() {
    console.log(`Su dung:
  node import-legacy-data.js [--base-url http://localhost:5243/api] [--updated-by migration-tool]
                             [--content <duong_dan_file_json>] [--directory <duong_dan_file_js|json>]
                             [--skip-content] [--skip-directory]

Mac dinh:
  content  : he-thong-moi-server-rieng/migration-data/content-tree.export.json
  directory: he-thong-moi-server-rieng/migration-data/directory-tree.export.json
             neu chua co thi dung file seed goc directory-seed.js
`);
}

function emptyToNull(value) {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
}

function toBool(value, fallback = true) {
    if (value === undefined || value === null) return fallback;
    return value !== false;
}

function toInt(value, fallback) {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function deterministicGuid(key) {
    const hash = crypto.createHash('sha1').update(String(key)).digest();
    const bytes = Buffer.from(hash.subarray(0, 16));
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
    ].join('-');
}

function extractTreeData(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.treeData)) return payload.treeData;
    if (payload.data && Array.isArray(payload.data.treeData)) return payload.data.treeData;
    if (payload.result && Array.isArray(payload.result.treeData)) return payload.result.treeData;
    return [];
}

function loadJsonTree(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const tree = extractTreeData(raw);
    if (!Array.isArray(tree)) {
        throw new Error(`Khong doc duoc mang treeData tu file JSON: ${filePath}`);
    }
    return tree;
}

function loadDirectorySeedJs(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(code, sandbox, { filename: filePath });
    if (!Array.isArray(sandbox.window.DIRECTORY_SEED)) {
        throw new Error(`File seed khong chua window.DIRECTORY_SEED hop le: ${filePath}`);
    }
    return sandbox.window.DIRECTORY_SEED;
}

function loadDirectorySource(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Khong tim thay file danh ba: ${filePath}`);
    }

    if (filePath.toLowerCase().endsWith('.js')) {
        return loadDirectorySeedJs(filePath);
    }

    const tree = loadJsonTree(filePath);
    if (!tree) {
        throw new Error(`Khong doc duoc treeData tu file danh ba: ${filePath}`);
    }

    return tree;
}

function buildPdfRefs(node) {
    if (Array.isArray(node?.pdfRefs)) {
        return node.pdfRefs.map((item) => ({
            doc: emptyToNull(item?.doc) || '',
            page: emptyToNull(item?.page) || ''
        })).filter((item) => item.doc || item.page);
    }

    if (node?.pdfPage) {
        return [{ doc: 'hd02', page: String(node.pdfPage) }];
    }

    return [];
}

function normalizeContentTree(nodes, parentId = null, depth = 0, parentLegacyId = 'root') {
    return (nodes || []).map((node, index) => {
        const fallbackLegacyId = `${parentLegacyId}/content-${index + 1}`;
        const legacyId = emptyToNull(node?.id) || fallbackLegacyId;
        const guid = deterministicGuid(`content:${legacyId}`);
        const normalizedChildren = normalizeContentTree(node?.children || [], guid, depth + 1, legacyId);

        return {
            id: guid,
            legacyId,
            parentId,
            title: String(node?.title || 'Chua dat ten'),
            tag: emptyToNull(node?.tag),
            summaryHtml: emptyToNull(node?.summary),
            detailHtml: emptyToNull(node?.detail),
            fileUrl: emptyToNull(node?.fileUrl),
            fileName: emptyToNull(node?.fileName),
            pdfRefsJson: JSON.stringify(buildPdfRefs(node)),
            forceAccordion: node?.forceAccordion === true,
            level: depth,
            sortOrder: toInt(node?.order ?? node?.sortOrder, index + 1),
            isActive: toBool(node?.isActive, true),
            children: normalizedChildren
        };
    });
}

function normalizeDirectoryTree(nodes, parentId = null, depth = 1, parentLegacyId = 'root') {
    return (nodes || []).map((node, index) => {
        const fallbackLegacyId = `${parentLegacyId}/directory-${index + 1}`;
        const legacyId = emptyToNull(node?.id) || fallbackLegacyId;
        const guid = deterministicGuid(`directory:${legacyId}`);
        const level = Math.max(1, Math.min(3, depth));
        const normalizedChildren = normalizeDirectoryTree(node?.children || [], guid, level + 1, legacyId);

        return {
            id: guid,
            legacyId,
            parentId,
            name: String(node?.name || node?.title || 'Don vi chua dat ten'),
            unitCode: emptyToNull(node?.unitCode || node?.maDonVi || node?.code),
            level,
            phone: emptyToNull(node?.phone),
            address: emptyToNull(node?.address),
            location: emptyToNull(node?.location),
            sortOrder: toInt(node?.sortOrder ?? node?.order, index + 1),
            isActive: toBool(node?.isActive, true),
            children: normalizedChildren
        };
    });
}

function countTree(nodes) {
    let count = 0;
    for (const node of nodes || []) {
        count += 1 + countTree(node.children || []);
    }
    return count;
}

async function postJson(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
    }

    if (data && data.success === false) {
        throw new Error(data.message || 'API tra ve that bai.');
    }

    return data;
}

async function importDirectory(options) {
    const sourceTree = loadDirectorySource(options.directorySource);
    const normalizedTree = normalizeDirectoryTree(sourceTree);
    const payload = { tree: normalizedTree, updatedBy: options.updatedBy };
    const result = await postJson(`${options.baseUrl}/directory/tree/sync`, payload);
    return {
        source: options.directorySource,
        rootCount: normalizedTree.length,
        totalCount: countTree(normalizedTree),
        apiCount: countTree(result?.data || [])
    };
}

async function importContent(options) {
    if (!fs.existsSync(options.contentSource)) {
        return null;
    }

    const sourceTree = loadJsonTree(options.contentSource);
    if (!sourceTree) {
        throw new Error(`Khong doc duoc noi dung APP_DATA tu file: ${options.contentSource}`);
    }

    const normalizedTree = normalizeContentTree(sourceTree);
    const payload = { tree: normalizedTree, updatedBy: options.updatedBy };
    const result = await postJson(`${options.baseUrl}/content/tree/sync`, payload);
    return {
        source: options.contentSource,
        rootCount: normalizedTree.length,
        totalCount: countTree(normalizedTree),
        apiCount: countTree(result?.data || [])
    };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const summary = [];

    console.log(`Base URL: ${options.baseUrl}`);
    console.log(`Updated by: ${options.updatedBy}`);

    if (!options.skipDirectory) {
        const result = await importDirectory(options);
        summary.push(`Danh ba: ${result.totalCount} don vi (${result.rootCount} goc) tu ${result.source}`);
    }

    if (!options.skipContent) {
        const result = await importContent(options);
        if (result) {
            summary.push(`Noi dung: ${result.totalCount} muc (${result.rootCount} goc) tu ${result.source}`);
        } else {
            summary.push(`Noi dung: bo qua do chua co file ${options.contentSource}`);
        }
    }

    console.log('');
    console.log('Hoan tat migrate:');
    summary.forEach((line) => console.log(`- ${line}`));
}

main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
});
