const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');

console.log('🚀 Running Git operations on:', repoRoot);

// 1. git init
console.log('\n--- 1. git init ---');
fs.mkdirSync(path.join(gitDir, 'objects', 'info'), { recursive: true });
fs.mkdirSync(path.join(gitDir, 'objects', 'pack'), { recursive: true });
fs.mkdirSync(path.join(gitDir, 'refs', 'heads'), { recursive: true });
fs.mkdirSync(path.join(gitDir, 'refs', 'tags'), { recursive: true });
fs.mkdirSync(path.join(gitDir, 'info'), { recursive: true });
fs.mkdirSync(path.join(gitDir, 'logs', 'refs', 'heads'), { recursive: true });

fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n');
fs.writeFileSync(path.join(gitDir, 'description'), 'Unnamed repository; edit this file "description" to name the repository.\n');
fs.writeFileSync(
  path.join(gitDir, 'config'),
  '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n\tignorecase = true\n\tprecomposeunicode = true\n[remote "origin"]\n\turl = https://github.com/Balakrishnan-oss/smart-cafe.git\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n[branch "main"]\n\tremote = origin\n\tmerge = refs/heads/main\n'
);
fs.writeFileSync(
  path.join(gitDir, 'info', 'exclude'),
  '# git ls-files --others --exclude-from=.git/info/exclude\n'
);
console.log('✔ Initialized empty Git repository in ' + gitDir);

// Helpers for Git object database
function hashObject(type, data) {
  const header = Buffer.from(`${type} ${data.length}\0`);
  const full = Buffer.concat([header, data]);
  const shaHex = crypto.createHash('sha1').update(full).digest('hex');
  return { shaHex, full };
}

function writeObject(type, data) {
  const { shaHex, full } = hashObject(type, data);
  const objDir = path.join(gitDir, 'objects', shaHex.slice(0, 2));
  const objFile = path.join(objDir, shaHex.slice(2));
  fs.mkdirSync(objDir, { recursive: true });
  fs.writeFileSync(objFile, zlib.deflateSync(full));
  return shaHex;
}

// 2. git add .
console.log('\n--- 2. git add . ---');

function shouldIgnore(relPath) {
  const parts = relPath.split('/');
  if (parts.includes('node_modules')) return true;
  if (parts.includes('.git')) return true;
  if (parts.includes('.DS_Store')) return true;
  if (parts.includes('.vscode')) return true;
  if (parts.includes('.idea')) return true;
  if (relPath === '.env.local' || relPath.endsWith('.local')) return true;
  if (relPath.startsWith('dist/') || relPath === 'dist') return true;
  return false;
}

function scanFiles(dir, relBase = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const ent of entries) {
    const rel = relBase ? `${relBase}/${ent.name}` : ent.name;
    if (shouldIgnore(rel)) continue;

    const fullPath = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...scanFiles(fullPath, rel));
    } else if (ent.isFile() || ent.isSymbolicLink()) {
      results.push({ rel, fullPath, isSymlink: ent.isSymbolicLink() });
    }
  }
  return results;
}

const fileList = scanFiles(repoRoot);
console.log(`Discovered ${fileList.length} files to stage.`);

const stagedItems = [];

for (const item of fileList) {
  let content;
  let mode;
  let stat;

  if (item.isSymlink) {
    stat = fs.lstatSync(item.fullPath);
    const linkTarget = fs.readlinkSync(item.fullPath);
    content = Buffer.from(linkTarget, 'utf8');
    mode = 0o120000; // git symlink
  } else {
    stat = fs.statSync(item.fullPath);
    content = fs.readFileSync(item.fullPath);
    const isExec = (stat.mode & 0o111) !== 0;
    mode = isExec ? 0o100755 : 0o100644;
  }

  const shaHex = writeObject('blob', content);
  stagedItems.push({
    relPath: item.rel,
    shaHex,
    stat,
    mode,
    size: content.length,
  });
}

// Sort staged items by path byte order
stagedItems.sort((a, b) => Buffer.compare(Buffer.from(a.relPath), Buffer.from(b.relPath)));

// Build index file (.git/index)
function buildGitIndex(items) {
  const chunks = [];
  const hdr = Buffer.alloc(12);
  hdr.write('DIRC', 0);
  hdr.writeUInt32BE(2, 4); // v2
  hdr.writeUInt32BE(items.length, 8);
  chunks.push(hdr);

  for (const it of items) {
    const pathBuf = Buffer.from(it.relPath, 'utf8');
    const shaBuf = Buffer.from(it.shaHex, 'hex');

    const fixed = Buffer.alloc(40 + 20 + 2);
    const ctimeS = Math.floor(it.stat.ctimeMs / 1000);
    const ctimeNs = Math.floor((it.stat.ctimeMs % 1000) * 1e6);
    const mtimeS = Math.floor(it.stat.mtimeMs / 1000);
    const mtimeNs = Math.floor((it.stat.mtimeMs % 1000) * 1e6);

    fixed.writeUInt32BE(ctimeS, 0);
    fixed.writeUInt32BE(ctimeNs, 4);
    fixed.writeUInt32BE(mtimeS, 8);
    fixed.writeUInt32BE(mtimeNs, 12);
    fixed.writeUInt32BE(it.stat.dev & 0xffffffff, 16);
    fixed.writeUInt32BE(it.stat.ino & 0xffffffff, 20);
    fixed.writeUInt32BE(it.mode, 24);
    fixed.writeUInt32BE(it.stat.uid & 0xffffffff, 28);
    fixed.writeUInt32BE(it.stat.gid & 0xffffffff, 32);
    fixed.writeUInt32BE(it.size & 0xffffffff, 36);
    shaBuf.copy(fixed, 40);
    fixed.writeUInt16BE(Math.min(pathBuf.length, 0x0fff), 60);

    const padLen = 8 - ((62 + pathBuf.length) % 8);
    const pad = Buffer.alloc(padLen, 0);

    chunks.push(fixed, pathBuf, pad);
  }

  const allBeforeSha = Buffer.concat(chunks);
  const checksum = crypto.createHash('sha1').update(allBeforeSha).digest();
  return Buffer.concat([allBeforeSha, checksum]);
}

const indexData = buildGitIndex(stagedItems);
fs.writeFileSync(path.join(gitDir, 'index'), indexData);
console.log(`✔ Created .git/index (${stagedItems.length} entries staged, size: ${indexData.length} bytes)`);

// 3. git commit -m "Smart Cafe full stack application"
console.log('\n--- 3. git commit -m "Smart Cafe full stack application" ---');

// Build directory tree recursively
// Tree structure in memory: node = { files: { name: { mode, shaHex } }, dirs: { name: node } }
function buildTreeStructure(items) {
  const rootNode = { files: {}, dirs: {} };
  for (const it of items) {
    const parts = it.relPath.split('/');
    let current = rootNode;
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      if (!current.dirs[dirName]) {
        current.dirs[dirName] = { files: {}, dirs: {} };
      }
      current = current.dirs[dirName];
    }
    const fileName = parts[parts.length - 1];
    current.files[fileName] = {
      mode: it.mode.toString(8), // octal string e.g. "100644", "100755", "120000"
      shaHex: it.shaHex,
    };
  }
  return rootNode;
}

function writeTreeNode(node) {
  const entries = [];

  // Subdirectories (trees)
  for (const dirName of Object.keys(node.dirs)) {
    const subTreeSha = writeTreeNode(node.dirs[dirName]);
    entries.push({
      name: dirName,
      isDir: true,
      modeStr: '40000',
      shaHex: subTreeSha,
    });
  }

  // Files
  for (const fileName of Object.keys(node.files)) {
    const f = node.files[fileName];
    entries.push({
      name: fileName,
      isDir: false,
      modeStr: f.mode,
      shaHex: f.shaHex,
    });
  }

  // Git sorting rule: directories compared as if trailing '/' exists
  entries.sort((a, b) => {
    const nameA = a.isDir ? a.name + '/' : a.name;
    const nameB = b.isDir ? b.name + '/' : b.name;
    return Buffer.compare(Buffer.from(nameA), Buffer.from(nameB));
  });

  const entryBuffers = [];
  for (const e of entries) {
    const header = Buffer.from(`${e.modeStr} ${e.name}\0`);
    const shaBuf = Buffer.from(e.shaHex, 'hex');
    entryBuffers.push(Buffer.concat([header, shaBuf]));
  }

  const treeContent = Buffer.concat(entryBuffers);
  return writeObject('tree', treeContent);
}

const rootNode = buildTreeStructure(stagedItems);
const rootTreeSha = writeTreeNode(rootNode);
console.log('✔ Root Tree SHA:', rootTreeSha);

// Create commit object
const now = Math.floor(Date.now() / 1000);
const tz = '+0530';
const author = 'Balakrishnan <balakrishnan@localhost>';
const commitMsg = 'Smart Cafe full stack application\n';

const commitBody =
  `tree ${rootTreeSha}\n` +
  `author ${author} ${now} ${tz}\n` +
  `committer ${author} ${now} ${tz}\n\n` +
  commitMsg;

const commitSha = writeObject('commit', Buffer.from(commitBody, 'utf8'));
console.log('✔ Commit SHA:', commitSha);

// Write branch ref
fs.writeFileSync(path.join(gitDir, 'refs', 'heads', 'main'), `${commitSha}\n`);

// Write reflogs
const reflogLine = `0000000000000000000000000000000000000000 ${commitSha} ${author} ${now} ${tz}\tcommit (initial): Smart Cafe full stack application\n`;
fs.writeFileSync(path.join(gitDir, 'logs', 'HEAD'), reflogLine);
fs.writeFileSync(path.join(gitDir, 'logs', 'refs', 'heads', 'main'), reflogLine);

// 4. git branch -M main
console.log('\n--- 4. git branch -M main ---');
fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n');
console.log('✔ Active branch set to main');

// Summary & Verification
console.log('\n========================================');
console.log('🎉 GIT OPERATIONS COMPLETED SUCCESSFULLY');
console.log('========================================');
console.log(`Branch:        main`);
console.log(`Commit:        ${commitSha}`);
console.log(`Tree:          ${rootTreeSha}`);
console.log(`Files Staged:  ${stagedItems.length}`);
console.log(`Message:       Smart Cafe full stack application`);
