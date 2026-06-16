<?php

namespace App\Http\Controllers;

use App\Models\NotebookSheet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class NotebookSheetController extends Controller
{
    private function getGuestUser(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->getGuestUser();

        $nextOrder = (int) $user->notebookSheets()->max('display_order') + 1;

        $sheet = $user->notebookSheets()->create([
            'display_order' => $nextOrder,
        ]);

        return redirect()->to('/workspace/notebook?sheet=' . $sheet->id);
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $this->getGuestUser();

        $sheets = $user->notebookSheets()
            ->orderBy('display_order')
            ->get();

            if ($sheets->isEmpty()) {
                return redirect()->to('/workspace/notebook');
            }
            
            if ($sheets->count() === 1) {
                return redirect()->to('/workspace/notebook?sheet=' . $sheets->first()->id);
            }

        $sheet = $sheets->firstWhere('id', $id);

        if (!$sheet) {
            abort(404);
        }

        $fallbackSheet = $sheets
            ->where('display_order', '<', $sheet->display_order)
            ->last()
            ?? $sheets
                ->where('display_order', '>', $sheet->display_order)
                ->first();

        DB::transaction(function () use ($user, $sheet) {
            $sheet->delete();

            $remainingSheets = $user->notebookSheets()
                ->orderBy('display_order')
                ->get();

            foreach ($remainingSheets as $index => $remainingSheet) {
                $remainingSheet->update([
                    'display_order' => $index + 1,
                ]);
            }
        });

        return redirect()->to('/workspace/notebook?sheet=' . $fallbackSheet->id);
    }
}
