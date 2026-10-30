<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterFiveController extends Controller
{
    private const array QUESTIONS = [
        ['question' => 'Pada konfigurasi sebelumnya, VLAN siswa dan guru memakai ID ...', 'options' => ['10 untuk siswa dan 20 untuk guru', '20 untuk siswa dan 10 untuk guru', '1 untuk siswa dan 2 untuk guru', '40 untuk siswa dan 60 untuk guru'], 'answer' => 0],
        ['question' => 'Port trunk antara switch dan router digunakan untuk ...', 'options' => ['Membawa beberapa VLAN dengan tag VLAN', 'Menghubungkan satu PC tanpa tag VLAN', 'Membagikan alamat IP ke switch', 'Mengubah password WiFi'], 'answer' => 0],
        ['question' => 'Pada port access, PVID menentukan ...', 'options' => ['VLAN untuk trafik masuk yang tidak bertag', 'Alamat IP gateway switch', 'Nama bridge', 'Port yang terhubung ke ISP'], 'answer' => 0],
        ['question' => 'Mengapa VLAN Filtering diaktifkan setelah bridge, port, dan tabel VLAN disiapkan?', 'options' => ['Agar pemetaan VLAN sudah lengkap sebelum penyaringan diterapkan', 'Agar switch membuat VLAN ID secara otomatis', 'Agar semua trafik keluar tanpa tag', 'Agar DHCP Server berpindah ke switch'], 'answer' => 0],
        ['question' => 'Apa yang diperiksa dengan ipconfig pada PC siswa dan PC guru?', 'options' => ['Alamat IP dan gateway tiap PC sesuai segmennya', 'Password yang tersimpan di router', 'Kecepatan kabel trunk', 'Daftar semua VLAN di RouterOS'], 'answer' => 0],
    ];

    public function show(Request $request): View|RedirectResponse
    {
        if ($request->user()->completedAdventureChapters() < 4) {
            return redirect()->route('adventure')->with('chapter_notice', 'Selesaikan Chapter 4 terlebih dahulu untuk membuka Chapter 5.');
        }

        $questions = array_map(fn (array $question): array => ['question' => $question['question'], 'options' => $question['options']], self::QUESTIONS);

        return view('chapter-five-workbench', ['questions' => $questions]);
    }

    public function complete(Request $request): JsonResponse
    {
        abort_if($request->user()->completedAdventureChapters() < 4, 403, 'Selesaikan Chapter 4 terlebih dahulu.');

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
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 5);
        $user->save();

        return response()->json(['message' => 'Chapter 5 selesai! Progresmu sudah tersimpan.', 'completedChapters' => $user->completedAdventureChapters(), ...$result]);
    }
}
