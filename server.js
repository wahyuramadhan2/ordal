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
    res.send('✅ Server Kurir CV (Jalur 587) Siap!');
});

app.post('/analyze', upload.single('cv'), async (req, res) => {
    try {
        const { nama, email, bidang } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Mana filenya bos?" });
        }

        console.log(`📂 Data diterima dari ${nama}. Mencoba kirim via Port 587...`);

        // --- SETTING EMAIL JALUR 587 (STARTTLS) ---
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,              // GANTI KE 587 (Biasanya lebih tembus firewall)
            secure: false,          // WAJIB FALSE kalau pakai 587
            requireTLS: true,       // Paksa enkripsi biar aman
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            },
            // Tambahan biar koneksi gak gampang putus
            tls: {
                ciphers: "SSLv3"
            }
        });

        await transporter.sendMail({
            from: `"Career Hub System" <${process.env.EMAIL_USER}>`, 
            to: process.env.EMAIL_USER, 
            replyTo: emailPelamar = email, // Biar bisa direply
            subject: `🔥 Lamaran Baru: ${nama} - ${bidang}`,
            html: `
                <h3>Ada Pelamar Baru nih! 🚀</h3>
                <ul>
                    <li><strong>Nama:</strong> ${nama}</li>
                    <li><strong>Posisi:</strong> ${bidang}</li>
                    <li><strong>Email Pelamar:</strong> ${email}</li>
                </ul>
                <p>File CV terlampir di email ini.</p>
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
app.listen(PORT, () => console.log(`🚀 Server Jalur 587 siap di port ${PORT}!`));
