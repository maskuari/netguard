<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterFiveController extends Controller
{
    private const array QUESTIONS = [
        ['question' => 'Port trunk antara switch dan router digunakan untuk ...', 'options' => ['Membawa beberapa VLAN melalui satu jalur uplink', 'Menghubungkan satu PC pada satu VLAN saja', 'Membagikan alamat IP seperti DHCP Server', 'Mengubah identity perangkat'], 'answer' => 0],
        ['question' => 'Mengapa port access dipetakan ke VLAN sesuai kelompok pengguna?', 'options' => ['Agar PC ditempatkan pada segmen jaringan yang benar', 'Agar semua port membawa semua VLAN sekaligus', 'Agar DNS publik berubah otomatis', 'Agar WinBox tidak memerlukan login'], 'answer' => 0],
        ['question' => 'Kabel PC dipindahkan dari ether2 ke ether4, tetapi IP tetap dari VLAN siswa. Apa yang diperiksa?', 'options' => ['Pemetaan VLAN port access dan DHCP pada segmen tujuan', 'Nama identity switch saja', 'File login HotSpot', 'Password WiFi'], 'answer' => 0],
        ['question' => 'Apa akibat keanggotaan VLAN pada menu Switch tidak sesuai dengan port pengguna?', 'options' => ['Trafik VLAN tidak sampai ke port yang seharusnya', 'Router otomatis menghapus semua IP address', 'Kabel UTP berubah menjadi kabel crossover', 'DNS Name HotSpot berubah sendiri'], 'answer' => 0],
        ['question' => 'Mengapa PC yang sama dipindahkan ke ether2, ether3, dan ether4 lalu menjalankan ipconfig?', 'options' => ['Untuk membuktikan setiap port memberikan IP dari VLAN dan subnet yang sesuai', 'Untuk mengganti identity switch secara otomatis', 'Untuk mengukur panjang kabel UTP', 'Untuk membuat aturan NAT baru'], 'answer' => 0],
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
            return response()->json(['message' => 'Masih ada jawaban yang belum tepat. Periksa hasil evaluasi dan coba lagi.', 'correctOptionIndexes' => array_column(self::QUESTIONS, 'answer'), ...$result], 422);
        }

        $user = $request->user();
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 5);
        $user->save();

        return response()->json(['message' => 'Chapter 5 selesai! Progresmu sudah tersimpan.', 'completedChapters' => $user->completedAdventureChapters(), ...$result]);
    }
}
