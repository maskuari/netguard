<?php

namespace App\Http\Controllers;

use App\Services\PracticeEvaluator;
use App\Services\PracticeScenario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PracticeController extends Controller
{
    public function show(Request $request, PracticeScenario $scenarios): View|RedirectResponse
    {
        if (! $request->user()->isPracticeUnlocked()) {
            return redirect()->route('homepage')->with('status', 'Selesaikan Chapter 3 Adventure untuk membuka Practice Mode.');
        }
        $attempts = $request->session()->get('practice.attempts', []);
        $id = (string) $request->query('attempt', '');
        if (! isset($attempts[$id]) || ($attempts[$id]['owner'] ?? null) !== $request->user()->id) {
            $previousId = (string) $request->query('previous', '');
            $previousType = ($attempts[$previousId]['owner'] ?? null) === $request->user()->id ? $attempts[$previousId]['type'] : $request->session()->get('practice.previous_type');
            $scenario = $scenarios->generate($previousType);
            $scenario['owner'] = $request->user()->id;
            $attempts[$scenario['id']] = $scenario;
            $request->session()->put('practice.attempts', array_slice($attempts, -10, null, true));
            $request->session()->put('practice.previous_type', $scenario['type']);

            return redirect()->route('practice', ['attempt' => $scenario['id']]);
        }
        $scenario = $attempts[$id];
        unset($scenario['rules'], $scenario['owner']);
        $scenario['briefing'] = $scenarios->briefing($scenario);

        return view('practice', ['scenario' => $scenario]);
    }

    public function check(Request $request, string $attempt, PracticeEvaluator $evaluator): JsonResponse
    {
        abort_unless($request->user()->isPracticeUnlocked(), 403);
        $scenario = $request->session()->get('practice.attempts.'.$attempt);
        abort_unless(is_array($scenario), 404, 'Soal kedaluwarsa. Mulai soal baru.');
        abort_unless(($scenario['owner'] ?? null) === $request->user()->id, 404);
        if (isset($scenario['result'])) {
            return response()->json($scenario['result']);
        }
        abort_if(strlen($request->getContent()) > 262144, 413);
        $validated = $request->validate(['state' => ['required', 'array'], 'state.tables' => ['required', 'array'], 'state.identity' => ['required', 'string', 'max:128']]);
        $result = $evaluator->evaluate($scenario, $validated['state']);
        $request->session()->put('practice.attempts.'.$attempt.'.result', $result);

        return response()->json($result);
    }
}
