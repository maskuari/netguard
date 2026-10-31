<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterTwoController extends Controller
{
    private const array QUESTIONS = [
        [
            'question' => 'Apa fungsi VLAN siswa dan guru pada jaringan sekolah?',
            'options' => ['Mengganti password WinBox', 'Memisahkan perangkat ke segmen jaringan logis', 'Mengubah kabel straight menjadi crossover', 'Mengaktifkan NAT secara otomatis'],
            'answer' => 1,
        ],
        [
            'question' => 'Apa perbedaan DHCP Client dan DHCP Server?',
            'options' => ['Keduanya hanya mengganti nama router', 'Client membuat VLAN, Server membuat NAT', 'Client menerima konfigurasi, Server membagikannya ke klien', 'Client mengatur SSID, Server mengatur DNS'],
            'answer' => 2,
        ],
        [
            'question' => 'Apa akibatnya jika gateway VLAN siswa dipasang pada interface yang salah?',
            'options' => ['Kabel berubah menjadi crossover', 'WinBox selalu tertutup', 'HotSpot otomatis terhapus', 'Klien siswa dapat gagal berkomunikasi melalui gateway-nya'],
            'answer' => 3,
        ],
        [
            'question' => 'Apa dampaknya jika pool DHCP berada di luar subnet gateway?',
            'options' => ['Klien mendapat konfigurasi IP yang tidak sesuai dan konektivitas terganggu', 'Router selalu memperbaiki alamat itu sendiri', 'VLAN otomatis berubah menjadi SSID', 'NAT aktif tanpa konfigurasi'],
            'answer' => 0,
        ],
        [
            'question' => 'PC siswa malah mendapat alamat dari subnet guru. Apa yang perlu diperiksa?',
            'options' => ['Identitas router saja', 'DNS publik saja', 'Pemetaan VLAN/interface serta DHCP Server masing-masing segmen', 'Halaman login HotSpot saja'],
            'answer' => 2,
        ],
    ];

    public function show(): View
    {
        $questions = array_map(
            fn (array $question): array => [
                'question' => $question['question'],
                'options' => $question['options'],
            ],
            self::QUESTIONS,
        );

        return view('chapter-two-workbench', ['questions' => $questions]);
    }

    public function complete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array', 'size:5'],
            'answers.*' => ['required', 'integer', 'between:0,3'],
        ]);

        $answers = array_values($validated['answers']);
        $score = 0;
        foreach (self::QUESTIONS as $index => $question) {
            if ($answers[$index] === $question['answer']) {
                $score++;
            }
        }

        $evaluationResult = [
            'score' => $score,
            'correctAnswers' => $score,
            'incorrectAnswers' => count(self::QUESTIONS) - $score,
            'totalQuestions' => count(self::QUESTIONS),
        ];

        if ($score !== count(self::QUESTIONS)) {
            $correctOptionIndexes = array_map(
                static fn (array $question): int => $question['answer'],
                self::QUESTIONS,
            );

            return response()->json([
                'message' => 'Masih ada jawaban yang perlu diperbaiki. Periksa tanda jawaban benar, lalu coba lagi.',
                'correctOptionIndexes' => $correctOptionIndexes,
                ...$evaluationResult,
            ], 422);
        }

        $user = $request->user();
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 2);
        $user->save();

        return response()->json(['message' => 'Chapter 2 selesai! Progresmu sudah tersimpan.', 'completedChapters' => $user->completedAdventureChapters(), ...$evaluationResult]);
    }
}
