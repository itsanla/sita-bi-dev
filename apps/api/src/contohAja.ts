/**
 * Script untuk testing WhatsApp Web.js
 * Mengirim pesan ke nomor tertentu
 *
 * Cara menjalankan:
 * npx ts-node -r tsconfig-paths/register src/contohAja.ts
 */

import { whatsappService } from './services/whatsapp.service';

async function testWhatsApp(): Promise<void> {
  console.warn('🚀 Starting WhatsApp test...\n');

  try {
    // Initialize WhatsApp jika belum
    console.warn('📱 Initializing WhatsApp...');
    await whatsappService.initialize();

    // Tunggu beberapa detik agar WhatsApp siap
    console.warn('⏳ Waiting for WhatsApp to be ready...');
    await waitForReady(30000); // Timeout 30 detik

    // Cek status
    const status = whatsappService.getStatus();
    console.warn('\n📊 WhatsApp Status:', status);

    if (!status.isReady) {
      console.error('❌ WhatsApp is not ready. Please scan QR code first!');
      process.exit(1);
    }

    // Nomor tujuan (format Indonesia: 628xxx)
    const targetNumber = '082284184525'; // Akan dikonversi ke 628xxx

    console.warn(`\n📤 Sending test message to ${targetNumber}...`);

    // Test 1: Kirim pesan teks biasa
    await whatsappService.sendMessage(
      targetNumber,
      '🎉 *Testing WhatsApp Integration SITA-BI*\n\n' +
        'Halo! Ini adalah pesan testing dari sistem SITA-BI.\n\n' +
        '✅ WhatsApp Web.js berhasil terintegrasi!\n' +
        '📱 Sistem notifikasi WhatsApp siap digunakan.\n\n' +
        '_Pesan ini dikirim secara otomatis dari backend API._',
    );

    console.warn('✅ Message sent successfully!\n');

    // Test 2: Cek apakah nomor terdaftar di WhatsApp
    console.warn(`🔍 Checking if ${targetNumber} is registered on WhatsApp...`);
    const isRegistered = await whatsappService.isRegistered(targetNumber);
    console.warn(
      `📋 Registration status: ${isRegistered ? '✅ Registered' : '❌ Not registered'}\n`,
    );

    // Test 3: Kirim pesan notifikasi bimbingan (simulasi)
    console.warn('📚 Sending bimbingan notification simulation...');
    await whatsappService.sendNotification('BIMBINGAN_CREATED', {
      mahasiswaPhone: targetNumber,
      tanggal: new Date().toLocaleDateString('id-ID'),
      mahasiswaNama: 'John Doe',
      catatan: 'Pembahasan BAB 1 - Pendahuluan',
    });

    console.warn('✅ Bimbingan notification sent!\n');

    // Test 4: Kirim pesan jadwal sidang (simulasi)
    console.warn('📅 Sending sidang schedule notification...');
    await whatsappService.sendNotification('SIDANG_SCHEDULED', {
      mahasiswaPhone: targetNumber,
      tanggal: '25 Januari 2025',
      waktu: '09:00 WIB',
      ruangan: 'Lab Komputer 1',
    });

    console.warn('✅ Sidang notification sent!\n');

    console.warn('🎊 All tests completed successfully!\n');
    console.warn('📊 Summary:');
    console.warn('  ✅ WhatsApp connection: OK');
    console.warn('  ✅ Send text message: OK');
    console.warn('  ✅ Check registration: OK');
    console.warn('  ✅ Send notifications: OK');
    console.warn('\n✨ WhatsApp integration is working perfectly!\n');

    // Keluar setelah selesai
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

/**
 * Helper function: Tunggu hingga WhatsApp ready
 */
async function waitForReady(timeout = 30000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = whatsappService.getStatus();

    if (status.isReady) {
      console.warn('✅ WhatsApp is ready!');
      return;
    }

    if (status.hasQR) {
      console.warn('📱 Please scan QR code...');
    }

    // Tunggu 2 detik sebelum cek lagi
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Timeout waiting for WhatsApp to be ready');
}

// Jalankan test
void testWhatsApp();
