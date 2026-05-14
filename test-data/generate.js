// Generate test data for time-echo upload testing
const fs = require('fs');
const path = require('path');

const OUT = __dirname;

// --- Chat content generators ---
const senders = ['我', '小明', '小红', '阿杰', '妈妈', '李老师'];
const otherSenders = ['小明', '小红', '阿杰', '妈妈', '李老师'];

const casualTopics = [
  ['今天天气真好', '是啊，适合出去走走'],
  ['吃饭了吗', '还没呢，你呢'],
  ['周末有什么安排', '想去看电影'],
  ['最近工作好忙', '注意休息啊'],
  ['你听说了吗', '什么事'],
  ['哈哈哈', '笑死我了'],
  ['晚安', '晚安好梦'],
  ['在吗', '在的'],
  ['推荐一家好吃的店', '哪里哪里'],
  ['新年快乐', '新年快乐！万事如意'],
  ['生快', '谢谢谢谢'],
  ['考试加油', '借你吉言'],
  ['这个表情包好好笑', '发来看看'],
  ['今天地铁人好多', '是啊，挤死了'],
  ['想你了', '我也是'],
];

const deepMemories = [
  ['还记得那年夏天我们一起骑车去海边吗', '当然记得，那是我最快乐的时光之一，海风吹在脸上，感觉整个世界都是我们的'],
  ['那时候我们说要一起开一家咖啡店', '对啊，虽然现在各奔东西，但那个梦想我一直留着'],
  ['高中毕业那天你写给我的同学录还在', '真的吗？我都快忘了写了什么了，能拍给我看看吗'],
  ['我记得你小时候超级怕狗', '哈哈现在不怕了，还养了一只金毛'],
  ['那次考试失利，是你陪我聊了一整晚', '因为我知道你不是能力不够，只是状态不好，后来你不是考上了理想的学校吗'],
  ['大学的那个跨年夜，我们在天台看烟花', '那晚真的很冷，但烟花很美，我们聊到凌晨三点'],
  ['你记不记得我们第一次见面的场景', '记得啊，你穿着蓝色的卫衣，看起来很腼腆，没想到后来成了最好的朋友'],
  ['那次生病住院，你每天来看我', '你是我最重要的朋友，那几天我真的很担心'],
  ['分手那天你在电话里哭了两个小时', '现在想想，那段经历让我成长了很多，谢谢你当时的陪伴'],
  ['我们一起去过的那些地方，我都还记得', '下次回来，我们一起去那家老店吃面吧'],
  ['初中时候我们一起参加演讲比赛', '你拿了第一名，我拿了第三，但你比我还开心'],
  ['那时候觉得高考就是人生的全部', '回头看，那只是人生的一个路口而已，我们都走出了自己的路'],
  ['大学四年最珍贵的回忆都和你有关', '从室友到挚友，这缘分真的很难得'],
  ['还记得我们约定十年后要在同一个地方拍照吗', '还有三年就到十年了，到时候不管在哪里，我都会去'],
  ['那封信我现在还留着', '什么信？哦，是毕业时候我写给你的那封啊，我都快忘了写了什么'],
];

const dailyTalk = [
  ['今天吃了麻辣烫', '我也想吃'],
  ['堵车堵了一个小时', '太惨了'],
  ['你有没有那个文件', '我找找发你'],
  ['明天开会记得带材料', '好的收到'],
  ['帮我带杯咖啡', '美式还是拿铁'],
  ['快递到了', '帮我拿一下谢谢'],
  ['这个方案你觉得怎么样', '还不错，第二段可以再改改'],
  ['下班了吗', '快了，还有十分钟'],
  ['周末聚餐来不来', '来，几点在哪'],
  ['生日快乐', '谢谢！'],
];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMessages(count, startDate) {
  const msgs = [];
  let date = new Date(startDate);
  for (let i = 0; i < count; i++) {
    date.setMinutes(date.getMinutes() + Math.floor(Math.random() * 60 + 1));
    const isMe = Math.random() < 0.45;
    const sender = isMe ? '我' : randomPick(otherSenders);

    let topic;
    if (i < 50) {
      topic = randomPick(deepMemories);
    } else if (Math.random() < 0.1) {
      topic = randomPick(deepMemories);
    } else if (Math.random() < 0.3) {
      topic = randomPick(casualTopics);
    } else {
      topic = randomPick(dailyTalk);
    }

    const ts = date.toISOString().replace('T', ' ').slice(0, 19);
    msgs.push({ timestamp: ts, sender, content: topic[isMe ? 1 : 0] || topic[0] });
    if (topic.length > 1) {
      date.setSeconds(date.getSeconds() + Math.floor(Math.random() * 120 + 10));
      const ts2 = date.toISOString().replace('T', ' ').slice(0, 19);
      msgs.push({ timestamp: ts2, sender: isMe ? randomPick(otherSenders) : '我', content: topic[isMe ? 0 : 1] });
    }
  }
  return msgs.slice(0, count);
}

const messages = generateMessages(520, '2023-01-15T10:00:00');

// --- 1. TXT format (WeChat style) ---
let txt = '';
for (const m of messages) {
  txt += `${m.timestamp} ${m.sender}\n${m.content}\n\n`;
}
fs.writeFileSync(path.join(OUT, '聊天记录_微信导出.txt'), txt, 'utf-8');

// --- 2. CSV format ---
let csv = 'timestamp,sender,content\n';
for (const m of messages) {
  csv += `"${m.timestamp}","${m.sender}","${m.content.replace(/"/g, '""')}"\n`;
}
fs.writeFileSync(path.join(OUT, '聊天记录_CSV导出.csv'), csv, 'utf-8');

// --- 3. HTML format with embedded images ---
let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>聊天记录</title></head><body>
<h1>聊天记录导出</h1>
<div class="messages">
`;
for (let i = 0; i < messages.length; i++) {
  const m = messages[i];
  html += `  <div class="message">
    <span class="time">${m.timestamp}</span>
    <span class="sender">${m.sender}</span>
    <span class="content">${m.content}</span>
  </div>\n`;
  // Insert some "screenshot" images at meaningful points
  if (i === 10 || i === 50 || i === 100 || i === 200 || i === 300 || i === 400) {
    html += `  <div class="message">
    <span class="time">${m.timestamp}</span>
    <span class="sender">${m.sender}</span>
    <span class="content">[图片]</span>
    <img src="screenshot_${i}.png" alt="聊天截图" />
  </div>\n`;
  }
}
html += '</div></body></html>';
fs.writeFileSync(path.join(OUT, '聊天记录_HTML导出.html'), html, 'utf-8');

// --- 4. JSON format ---
fs.writeFileSync(path.join(OUT, '聊天记录_JSON导出.json'), JSON.stringify({ messages, metadata: { total_messages: messages.length, format: 'json' } }, null, 2), 'utf-8');

// --- 5. Generate placeholder "screenshot" images (valid minimal PNG) ---
function createPlaceholderPNG(filename, label, width = 400, height = 300) {
  // Create a simple valid PNG with colored background and text
  // Use raw bytes to build a minimal PNG
  const zlib = require('zlib');

  // Create raw RGBA pixel data
  const rawData = Buffer.alloc((width * height * 4) + height); // +height for filter bytes
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const idx = y * (width * 4 + 1) + 1 + x * 4;
      // Gradient background based on filename hash
      const r = (180 + (y / height) * 75) | 0;
      const g = (200 + (x / width) * 55) | 0;
      const b = 220;
      rawData[idx] = r;
      rawData[idx + 1] = g;
      rawData[idx + 2] = b;
      rawData[idx + 3] = 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, typeB, data, crcVal]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // tEXt chunk with label
  const labelData = Buffer.from(`Comment\0${label}`, 'ascii');

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('tEXt', labelData),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filename, png);
}

// Generate screenshot placeholders
const screenshots = [
  { file: 'screenshot_10.png', label: '聊天截图 - 深刻回忆 2023-01-15' },
  { file: 'screenshot_50.png', label: '聊天截图 - 大学时光 2023-02-20' },
  { file: 'screenshot_100.png', label: '聊天截图 - 毕业季 2023-04-05' },
  { file: 'screenshot_200.png', label: '聊天截图 - 旅行计划 2023-06-12' },
  { file: 'screenshot_300.png', label: '聊天截图 - 生日祝福 2023-08-28' },
  { file: 'screenshot_400.png', label: '聊天截图 - 新年问候 2023-12-31' },
  { file: '朋友圈_毕业照.png', label: '朋友圈截图 - 大学毕业典礼' },
  { file: '朋友圈_旅行.png', label: '朋友圈截图 - 云南旅行' },
  { file: '朋友圈_新年.png', label: '朋友圈截图 - 2024新年' },
  { file: '深刻回忆_信件.png', label: '深刻回忆 - 手写信件' },
  { file: '深刻回忆_合影.png', label: '深刻回忆 - 老照片合影' },
];

for (const s of screenshots) {
  createPlaceholderPNG(path.join(OUT, s.file), s.label);
}

// --- 6. Generate ZIP containing everything ---
const JSZip = require('jszip');
async function makeZip() {
  const zip = new JSZip();
  zip.file('聊天记录_微信导出.txt', txt);
  for (const s of screenshots) {
    zip.file(s.file, fs.readFileSync(path.join(OUT, s.file)));
  }
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(OUT, '聊天记录_完整导出.zip'), zipBuf);
}
makeZip().then(() => {
  console.log('All test files generated in:', OUT);
  console.log('Files:');
  fs.readdirSync(OUT).forEach(f => console.log('  ' + f));
});
