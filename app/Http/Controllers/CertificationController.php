<?php

namespace App\Http\Controllers;

use App\Services\CertificationEvaluator;
use App\Services\CertificationScenario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CertificationController extends Controller
{
    public function show(Request $request, CertificationScenario $scenarios): View|RedirectResponse
    {
        if (! $request->user()->isCertificationUnlocked()) {
            return redirect()->route('homepage')->with('status', 'Selesaikan seluruh Adventure untuk membuka Certification Mode.');
        }
        $attempts = $request->session()->get('certification.attempts', []);
        $id = (string) $request->query('attempt', '');
        if (! isset($attempts[$id]) || ($attempts[$id]['owner'] ?? null) !== $request->user()->id) {
            $scenario = $scenarios->generate();
            $scenario['owner'] = $request->user()->id;
            $attempts[$scenario['id']] = $scenario;
            $request->session()->put('certification.attempts', array_slice($attempts, -5, null, true));

            return redirect()->route('certification', ['attempt' => $scenario['id']]);
        }
        $scenario = $attempts[$id];
        unset($scenario['owner'], $scenario['rules']);

        return view('practice', ['scenario' => $scenario]);
    }

    public function certificate(Request $request): View|RedirectResponse
    {
        $user = $request->user();
        if (! $user->isCertificationCompleted()) {
            return redirect()->route('homepage')->with('status', 'Selesaikan Certification Mode terlebih dahulu untuk mendapatkan sertifikat.');
        }

        return view('certification-certificate', ['student' => $user]);
    }

    public function check(Request $request, string $attempt, CertificationEvaluator $evaluator): JsonResponse
    {
        abort_unless($request->user()->isCertificationUnlocked(), 403);
        $scenario = $request->session()->get('certification.attempts.'.$attempt);
        abort_unless(is_array($scenario) && ($scenario['owner'] ?? null) === $request->user()->id, 404);
        if (isset($scenario['result'])) {
            return response()->json($scenario['result']);
        }
        abort_if(strlen($request->getContent()) > 524288, 413);
        $data = $request->validate(['state' => ['required', 'array'], 'state.devices' => ['required', 'array'], 'state.devices.hap' => ['required', 'array'], 'state.devices.hex' => ['required', 'array'], 'state.physical' => ['required', 'array']]);
        $result = $evaluator->evaluate($scenario, $data['state']);
        $request->session()->put('certification.attempts.'.$attempt.'.result', $result);
        if ($result['correct']) {
            $user = $request->user();
            $user->forceFill([
                'certification_score' => 100,
                'certification_completed_at' => $user->certification_completed_at ?? now(),
            ])->save();
        }

        return response()->json($result);
    }
}
