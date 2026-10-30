<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterFourController extends Controller
{
    private const array QUESTIONS = [
        ['question' => 'Fungsi SSID pada wireless adalah ...', 'options' => ['Nama jaringan WiFi yang terlihat oleh perangkat klien', 'Password akun HotSpot', 'Alamat gateway internet', 'Batas bandwidth pengguna'], 'answer' => 0],
        ['question' => 'Perbedaan password WiFi dan akun HotSpot adalah ...', 'options' => ['Password WiFi untuk bergabung ke wireless, akun HotSpot untuk login layanan setelah terhubung', 'Keduanya selalu sama', 'Akun HotSpot mengganti SSID', 'Password WiFi mengatur VLAN ID'], 'answer' => 0],
        ['question' => 'Security Profile user sudah dibuat, tetapi belum dipilih pada wlan1. Akibatnya ...', 'options' => ['wlan1 belum memakai pengaturan keamanan profile user tersebut', 'Semua akun HotSpot otomatis terhapus', 'IP gateway berubah', 'Rate limit guru otomatis aktif'], 'answer' => 0],
        ['question' => 'Rate Limit pada User Profile HotSpot digunakan untuk ...', 'options' => ['Membatasi kecepatan trafik akun yang memakai profile tersebut', 'Mengubah nama jaringan WiFi', 'Mengatur warna halaman login', 'Mengganti IP DNS'], 'answer' => 0],
        ['question' => 'Akun siswa harus mendapat batas 128k/128k. Pengaturan yang benar adalah ...', 'options' => ['Buat profile siswa dengan rate limit 128k/128k, lalu pilih profile siswa pada akun siswa', 'Ubah nama router menjadi siswa', 'Masukkan 128 pada VLAN ID', 'Ganti SSID menjadi 128k'], 'answer' => 0],
    ];

    public function show(Request $request): View|RedirectResponse
    {
        if ($request->user()->completedAdventureChapters() < 3) {
            return redirect()->route('adventure')->with('chapter_notice', 'Selesaikan Chapter 3 terlebih dahulu untuk membuka Chapter 4.');
        }

        $questions = array_map(fn (array $question): array => ['question' => $question['question'], 'options' => $question['options']], self::QUESTIONS);

        return view('chapter-four-workbench', ['questions' => $questions]);
    }

    public function complete(Request $request): JsonResponse
    {
        abort_if($request->user()->completedAdventureChapters() < 3, 403, 'Selesaikan Chapter 3 terlebih dahulu.');

        $validated = $request->validate(['answers' => ['required', 'array', 'size:5'], 'answers.*' => ['required', 'integer', 'between:0,3']]);
        $answers = array_values($validated['answers']);
        $score = 0;
        foreach (self::QUESTIONS as $index => $question) {
            if ($answers[$index] === $question['answer']) {
                $score++;
            }
        }
        $result = ['score' => $score, 'correctAnswers' => $score, 'incorrectAnswers' => count(self::QUESTIONS) - $score, 'totalQuestions' => count(self::QUESTIONS)];
        if ($score !== count(self::QUESTIONS)) {
            return response()->json(['message' => 'Masih ada jawaban yang belum tepat. Periksa hasil evaluasi dan coba lagi.', ...$result], 422);
        }

        $user = $request->user();
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 4);
        $user->save();

        return response()->json(['message' => 'Chapter 4 selesai! Progresmu sudah tersimpan.', 'completedChapters' => $user->completedAdventureChapters(), ...$result]);
    }
}
