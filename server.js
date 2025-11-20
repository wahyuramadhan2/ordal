require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.send('✅ Server Kurir CV (IPv4 Force) Siap!');
});

app.post('/analyze', upload.single('cv'), async (req, res) => {
    try {
        const { nama, email, bidang } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Mana filenya bos?" });
        }

        console.log(`📂 Data diterima: ${nama}. Mencoba kirim via IPv4...`);

        // --- SETTING EMAIL VERSI PAKSA IPv4 ---
        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            },
            // 👇 INI KUNCINYA BANG 👇
            family: 4, // Memaksa pakai IPv4 biar gak nyasar ke IPv6 yang sering diblokir
        });

        await transporter.sendMail({
            from: `"Career Hub System" <${process.env.EMAIL_USER}>`, 
            to: process.env.EMAIL_USER, 
            replyTo: email,
            subject: `🔥 Lamaran Baru: ${nama} - ${bidang}`,
            html: `
                <h3>Pelamar Baru! 🚀</h3>
                <p>Nama: ${nama} <br> Posisi: ${bidang} <br> Email: ${email}</p>
                <p>CV terlampir.</p>
            `,
            attachments: [{ filename: `${nama}_CV.pdf`, path: req.file.path }]
        });

        fs.unlinkSync(req.file.path);
        console.log("✅ Email SUKSES Terkirim!");
        res.json({ success: true, message: "Berhasil terkirim!" });

    } catch (error) {
        console.error("❌ GAGAL KIRIM:", error);
        res.status(500).json({ success: false, message: "Gagal: " + error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server siap di port ${PORT}!`));
