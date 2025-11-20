require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

// Setup tempat simpan file sementara
const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('cv'), async (req, res) => {
    try {
        const { nama, email, bidang } = req.body; // 'email' disini adalah email pelamar

        // 1. Cek File
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Mana filenya bos?" });
        }

        console.log(`📂 Menerima lamaran dari: ${nama} (${bidang})`);

        // 2. KIRIM EMAIL KE KAMU (ADMIN)
        // Isinya: Data pelamar + File CV dia dilampirkan
        await sendEmailToAdmin(nama, email, bidang, req.file);

        // 3. Hapus file dari folder uploads supaya gak menuhin laptop
        fs.unlinkSync(req.file.path);
        
        console.log("✅ CV berhasil dikirim ke email kamu!");
        res.json({ success: true, message: "Lamaran berhasil dikirim!" });

    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).json({ success: false, message: "Gagal kirim: " + error.message });
    }
});

async function sendEmailToAdmin(namaPelamar, emailPelamar, posisi, fileCV) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.EMAIL_USER, // Email pengirim (Email Kamu)
            pass: process.env.EMAIL_PASS  // App Password Kamu
        }
    });

    await transporter.sendMail({
        from: `"Career Hub System" <${process.env.EMAIL_USER}>`, 
        to: process.env.EMAIL_USER, // KIRIM KE DIRI SENDIRI (ADMIN)
        replyTo: emailPelamar, // Biar kalau kamu klik Reply, langsung ke pelamar
        subject: `🔥 Lamaran Baru: ${namaPelamar} - ${posisi}`,
        html: `
            <h3>Ada Pelamar Baru nih! 🚀</h3>
            <ul>
                <li><strong>Nama:</strong> ${namaPelamar}</li>
                <li><strong>Posisi:</strong> ${posisi}</li>
                <li><strong>Email Pelamar:</strong> ${emailPelamar}</li>
            </ul>
            <p>File CV terlampir di email ini. Silakan di-review manual.</p>
        `,
        attachments: [
            {
                filename: `${namaPelamar}_CV.pdf`, // Nama file pas masuk email
                path: fileCV.path // Ambil file yang barusan diupload
            }
        ]
    });
}

app.listen(3001, () => console.log('🚀 Server Kurir CV siap di port 3001!'));