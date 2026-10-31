<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterThreeController extends Controller
{
    private const array QUESTIONS = [
        ['question' => 'Fungsi DNS dalam jaringan adalah ...', 'options' => ['Menerjemahkan nama domain menjadi alamat IP', 'Membagi port switch menjadi VLAN', 'Membuat kabel straight', 'Membatasi jumlah user HotSpot'], 'answer' => 0],
        ['question' => 'Router dapat melakukan ping ke alamat IP di internet, tetapi gagal mengakses tujuan berdasarkan nama domain. Bagian yang paling perlu diperiksa adalah ...', 'options' => ['Pengaturan DNS', 'Urutan warna kabel T568B', 'Identity router', 'User Profile HotSpot'], 'answer' => 0],
        ['question' => 'Fungsi NAT masquerade pada skenario chapter ini adalah ...', 'options' => ['Menerjemahkan trafik dari jaringan lokal ketika keluar melalui interface internet', 'Membagikan alamat IP kepada klien', 'Membuat SSID wireless', 'Menentukan VLAN access pada switch'], 'answer' => 0],
        ['question' => 'Router sudah dapat mengakses internet, tetapi klien lokal belum dapat mengakses internet. Salah satu penyebab yang paling relevan adalah ...', 'options' => ['Aturan NAT masquerade atau konfigurasi IP/gateway klien belum benar', 'Nama identity router terlalu pendek', 'Warna kabel RJ45 tidak tertulis di modul', 'Security Profile belum diberi nama user'], 'answer' => 0],
        ['question' => 'Urutan troubleshooting internet yang paling tepat sesuai chapter ini adalah ...', 'options' => ['Link WAN → DHCP Client/jalur keluar → konektivitas router → DNS/NAT → pengujian klien', 'HotSpot → VLAN switch → crimping → identity → DNS', 'Ganti SSID → hapus VLAN → buat user → uji kabel', 'Langsung mengubah konfigurasi klien tanpa memeriksa router'], 'answer' => 0],
    ];

    public function show(Request $request): View|RedirectResponse
    {
        if ($request->user()->completedAdventureChapters() < 2) {
            return redirect()->route('adventure')->with('chapter_notice', 'Selesaikan Chapter 2 terlebih dahulu untuk membuka Chapter 3.');
        }

        $questions = array_map(fn (array $question): array => ['question' => $question['question'], 'options' => $question['options']], self::QUESTIONS);

        return view('chapter-three-workbench', ['questions' => $questions]);
    }

    public function complete(Request $request): JsonResponse
    {
        abort_if($request->user()->completedAdventureChapters() < 2, 403, 'Selesaikan Chapter 2 terlebih dahulu.');

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
            return response()->json(['message' => 'Masih ada jawaban yang belum tepat. Periksa hasil evaluasi dan coba lagi.', 'correctOptionIndexes' => array_column(self::QUESTIONS, 'answer'), ...$result], 422);
        }

        $user = $request->user();
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 3);
        $user->save();

        return response()->json(['message' => 'Chapter 3 selesai! Progresmu sudah tersimpan.', 'completedChapters' => $user->completedAdventureChapters(), ...$result]);
    }
}
