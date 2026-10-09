<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChapterOneController extends Controller
{
    private const array QUESTIONS = [
        [
            'question' => 'Apa ciri kabel straight yang benar pada latihan ini?',
            'options' => [
                'Ujung A memakai T568A dan ujung B memakai T568B',
                'Kedua ujung memakai urutan T568B yang sama',
                'Hanya empat inti kabel yang masuk ke RJ45',
                'Warna boleh berbeda selama konektor terkunci',
            ],
            'answer' => 1,
        ],
        [
            'question' => 'Indikator nomor 4 pada LAN tester tidak menyala. Apa yang paling mungkin terjadi?',
            'options' => [
                'Router belum memiliki DNS',
                'SSID belum diaktifkan',
                'Pin 4 tidak terhubung dengan baik',
                'VLAN pada switch belum dibuat',
            ],
            'answer' => 2,
        ],
        [
            'question' => 'Dalam topologi awal, port router mana yang dipakai PC konfigurasi?',
            'options' => [
                'ether3',
                'ether1',
                'ether2',
                'wlan1',
            ],
            'answer' => 0,
        ],
        [
            'question' => 'Apa langkah pertama saat router tidak muncul di WinBox Neighbors?',
            'options' => [
                'Langsung membuat NAT masquerade',
                'Mengubah semua VLAN ID',
                'Menghapus seluruh interface',
                'Memeriksa kabel, indikator link, dan adapter jaringan PC',
            ],
            'answer' => 3,
        ],
        [
            'question' => 'Mengapa ether1, ether2, dan ether3 diberi nama sesuai fungsinya?',
            'options' => [
                'Agar MAC Address berubah otomatis',
                'Agar DHCP Server langsung aktif',
                'Agar peran port jelas dan kesalahan konfigurasi berkurang',
                'Agar kabel tidak perlu diuji',
            ],
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

        return view('chapter-one', ['questions' => $questions]);
    }

    public function resetProgress(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->completed_adventure_chapters = 0;
        $user->save();

        return response()->json([
            'message' => 'Progres Adventure Mode telah direset.',
            'completedChapters' => 0,
        ]);
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

        if ($score !== count(self::QUESTIONS)) {
            return response()->json([
                'message' => 'Masih ada jawaban yang belum tepat. Pelajari petunjuknya lalu coba lagi.',
                'score' => $score,
            ], 422);
        }

        $user = $request->user();
        $user->completed_adventure_chapters = max($user->completedAdventureChapters(), 1);
        $user->save();

        return response()->json([
            'message' => 'Chapter 1 selesai! Progresmu sudah tersimpan.',
            'completedChapters' => $user->completedAdventureChapters(),
        ]);
    }
}
