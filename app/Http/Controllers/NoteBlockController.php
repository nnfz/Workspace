<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteBlockRequest;
use App\Http\Requests\UpdateNoteBlockRequest;
use App\Models\NoteBlock;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;

class NoteBlockController extends Controller
{
    private function getGuestUser(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function store(StoreNoteBlockRequest $request): JsonResponse
    {
        $user = $this->getGuestUser();
        $sheetId = (int) $request->validated()['sheet_id'];

        $sheet = $user->notebookSheets()->findOrFail($sheetId);

        $payload = $request->validated();

        $block = $sheet->noteBlocks()->create([
            'user_id' => $user->id,
            'content' => $payload['content'] ?? '',
            'x' => $payload['x'],
            'y' => $payload['y'],
        ]);

        return response()->json([
            'success' => true,
            'block' => $this->serializeBlock($block),
        ], 201);
    }

    public function update(UpdateNoteBlockRequest $request, int $id): JsonResponse
    {
        $user = $this->getGuestUser();
        try {
            $block = $user->noteBlocks()->findOrFail($id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Блок не найден',
            ], 404);
        }

        $block->update($request->validated());
        $block->refresh();

        return response()->json([
            'success' => true,
            'block' => $this->serializeBlock($block),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $this->getGuestUser();
        try {
            $block = $user->noteBlocks()->findOrFail($id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Блок не найден',
            ], 404);
        }

        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Блок удалён',
        ]);
    }

    private function serializeBlock(NoteBlock $block): array
    {
        return [
            'id' => $block->id,
            'content' => $block->content ?? '',
            'x' => (int) $block->x,
            'y' => (int) $block->y,
        ];
    }
}
