# 📅 Due Date Calculator · คำนวณงวดชำระ

เครื่องมือคำนวณวันดิวเดทตามจำนวนงวดชำระ พร้อม Export Excel — สร้างด้วย HTML/CSS/JS ล้วน ไม่ต้องติดตั้งหรือ build อะไรทั้งสิ้น

## ✨ ฟีเจอร์

- 📆 กำหนดวันดิวเดทเริ่มต้นและจำนวนงวด
- 🔁 รองรับหลายความถี่: รายสัปดาห์ / รายเดือน / ทุก 2 เดือน / รายไตรมาส / รายปี
- 💰 กรอกจำนวนเงินต่องวด (ไม่บังคับ) พร้อมคำนวณยอดรวม
- 🗓️ แสดงวันที่ทั้งแบบไทย (พ.ศ.) และสากล (ค.ศ.)
- 📊 Export เป็นไฟล์ `.xlsx` พร้อมใช้งานใน Excel ได้ทันที

## 🚀 วิธีใช้งาน

### วิธีที่ 1 — เปิดไฟล์โดยตรง

```bash
git clone https://github.com/<your-username>/due-date-calculator.git
cd due-date-calculator
# เปิดไฟล์ index.html ในเบราว์เซอร์ได้เลย
open index.html
```

### วิธีที่ 2 — รันด้วย Local Server (แนะนำ)

```bash
# Python 3
python3 -m http.server 3000

# หรือ Node.js (npx)
npx serve .
```

แล้วเปิด `http://localhost:3000` ในเบราว์เซอร์

## 📁 โครงสร้างไฟล์

```
due-date-calculator/
├── index.html   # หน้าหลัก (โครงสร้าง HTML)
├── style.css    # สไตล์ทั้งหมด
├── app.js       # Logic การคำนวณและ Export
└── README.md    # ไฟล์นี้
```

## 🛠️ เทคโนโลยีที่ใช้

| เทคโนโลยี | วัตถุประสงค์ |
|-----------|-------------|
| HTML5 | โครงสร้างหน้าเว็บ |
| CSS3 | ธีม Dark mode + Layout |
| Vanilla JavaScript | Logic การคำนวณ |
| [SheetJS (xlsx)](https://sheetjs.com/) | Export ไฟล์ Excel |
| [IBM Plex Sans Thai](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai) | ฟอนต์ภาษาไทย |

## 📦 Deploy บน GitHub Pages

1. ไปที่ **Settings → Pages** ใน repository
2. เลือก Branch: `main`, Folder: `/ (root)`
3. กด **Save** — เว็บจะขึ้น live ที่ `https://<username>.github.io/due-date-calculator/`

## 📝 License

MIT License — ใช้งานได้อย่างอิสระ
